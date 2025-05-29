"""Security Input Validator for StockPulse Authentication Hardening.

Comprehensive input validation and sanitization service protecting against
SQL injection, XSS, CSRF, and other input-based attacks with enterprise-grade
validation patterns for financial applications.
"""

import html
import json
import re
import urllib.parse
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from pydantic import BaseModel, validator
from structlog import get_logger


class ValidationResult(str, Enum):
    """Input validation result types."""

    VALID = "valid"
    INVALID = "invalid"
    SUSPICIOUS = "suspicious"
    BLOCKED = "blocked"


class ThreatType(str, Enum):
    """Types of security threats detected in input."""

    SQL_INJECTION = "sql_injection"
    XSS_ATTACK = "xss_attack"
    COMMAND_INJECTION = "command_injection"
    PATH_TRAVERSAL = "path_traversal"
    LDAP_INJECTION = "ldap_injection"
    SCRIPT_INJECTION = "script_injection"
    HTML_INJECTION = "html_injection"
    XML_INJECTION = "xml_injection"
    HEADER_INJECTION = "header_injection"
    EMAIL_INJECTION = "email_injection"
    MALICIOUS_FILE = "malicious_file"
    EXCESSIVE_LENGTH = "excessive_length"
    INVALID_FORMAT = "invalid_format"


@dataclass
class ValidationAnalysis:
    """Detailed analysis of input validation."""

    is_valid: bool
    result: ValidationResult
    threats_detected: List[ThreatType]
    sanitized_input: str
    risk_score: float  # 0.0 to 100.0
    error_message: Optional[str] = None
    details: Optional[Dict] = None


class SecurityInputValidator:
    """
    Enterprise-grade input validation and sanitization service.

    Features:
    - SQL injection prevention with pattern detection
    - XSS protection with comprehensive sanitization
    - Command injection blocking
    - Path traversal prevention
    - LDAP injection protection
    - Email and header injection prevention
    - File upload security validation
    - Financial data format validation
    - Real-time threat analysis and scoring
    """

    def __init__(self):
        """Initialize security input validator with threat patterns."""
        self.logger = get_logger(__name__)

        # Maximum input lengths for different field types
        self.MAX_LENGTHS = {
            "username": 50,
            "email": 254,  # RFC 5321 limit
            "password": 128,
            "name": 100,
            "description": 1000,
            "comment": 500,
            "search": 200,
            "general": 255,
        }

        # SQL injection patterns
        self.SQL_PATTERNS = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
            r"(\b(UNION|OR|AND)\s+(SELECT|INSERT|UPDATE|DELETE)\b)",
            r"(\b(UNION)\s+(ALL\s+)?SELECT\b)",
            r"(\')(.*)(--|\#)",
            r"(\;|\')(.*)(DROP|DELETE|INSERT|UPDATE)",
            r"(\bOR\b\s*[\'\"]*\s*[0-9])",
            r"(\bAND\b\s*[\'\"]*\s*[0-9])",
            r"(\b(WAITFOR|DELAY)\b)",
            r"(\b(BENCHMARK|SLEEP|pg_sleep)\b)",
            r"(\'\s*(OR|AND)\s*\'[^\']*\'\s*=\s*\')",
            r"(\'\s*;\s*(DROP|DELETE|INSERT|UPDATE))",
            r"(\b(information_schema|sys\.|pg_)\b)",
        ]

        # XSS patterns
        self.XSS_PATTERNS = [
            r"<\s*script[^>]*>.*?</\s*script\s*>",
            r"<\s*iframe[^>]*>.*?</\s*iframe\s*>",
            r"<\s*object[^>]*>.*?</\s*object\s*>",
            r"<\s*embed[^>]*>.*?</\s*embed\s*>",
            r"<\s*link[^>]*>",
            r"<\s*meta[^>]*>",
            r"<\s*form[^>]*>",
            r"javascript\s*:",
            r"vbscript\s*:",
            r"data\s*:\s*text/html",
            r"on\w+\s*=",
            r"expression\s*\(",
            r"url\s*\(",
            r"@import",
            r"<\s*style[^>]*>.*?</\s*style\s*>",
            r"<\s*base[^>]*>",
        ]

        # Command injection patterns
        self.COMMAND_PATTERNS = [
            r"(\;|\||&|\$\(|\`)",
            r"(\b(cat|ls|dir|type|echo|ping|wget|curl|nc|netcat)\b)",
            r"(\/bin\/|\/usr\/bin\/|cmd\.exe|powershell)",
            r"(\.\.(\/|\\))",
            r"(\$\{.*\})",
            r"(\%\{.*\})",
        ]

        # Path traversal patterns
        self.PATH_TRAVERSAL_PATTERNS = [
            r"(\.\.(\/|\\))",
            r"(\/\.\.(\/|\\))",
            r"(\.\.(\/|\\).*\.(exe|bat|cmd|sh|ps1))",
            r"(\.\.\/\.\.\/)",
            r"(\.\.\\\.\.\\)",
        ]

        # LDAP injection patterns
        self.LDAP_PATTERNS = [
            r"(\(\|\()",
            r"(\)(\(|\|))",
            r"(\*\)\()",
            r"(\(\&\()",
            r"(\(\!\()",
        ]

        # Email injection patterns
        self.EMAIL_PATTERNS = [
            r"(\r\n|\r|\n)(%0A|%0D|%0a|%0d)",
            r"(bcc\s*:|cc\s*:|to\s*:)",
            r"(content-type\s*:|mime-version\s*:)",
            r"(\r\n.*\r\n)",
        ]

        # Financial data patterns for validation
        self.FINANCIAL_PATTERNS = {
            "amount": r"^\d+(\.\d{1,2})?$",
            "percentage": r"^\d{1,3}(\.\d{1,4})?$",
            "ticker": r"^[A-Z]{1,5}$",
            "cusip": r"^[0-9A-Z]{9}$",
            "isin": r"^[A-Z]{2}[0-9A-Z]{9}[0-9]$",
        }

    async def validate_input(
        self,
        input_value: Any,
        field_type: str = "general",
        context: Optional[Dict] = None,
    ) -> ValidationAnalysis:
        """
        Comprehensive input validation and threat analysis.

        Args:
            input_value: Input to validate
            field_type: Type of field (username, email, password, etc.)
            context: Additional context for validation

        Returns:
            ValidationAnalysis: Detailed validation result
        """
        try:
            # Convert input to string for analysis
            if input_value is None:
                return ValidationAnalysis(
                    is_valid=True,
                    result=ValidationResult.VALID,
                    threats_detected=[],
                    sanitized_input="",
                    risk_score=0.0,
                )

            input_str = str(input_value)

            # Initialize analysis
            threats_detected = []
            risk_score = 0.0
            error_messages = []

            # Check input length
            max_length = self.MAX_LENGTHS.get(field_type, self.MAX_LENGTHS["general"])
            if len(input_str) > max_length:
                threats_detected.append(ThreatType.EXCESSIVE_LENGTH)
                risk_score += 20.0
                error_messages.append(f"Input exceeds maximum length of {max_length}")

            # SQL injection detection
            sql_threats = await self._detect_sql_injection(input_str)
            if sql_threats:
                threats_detected.extend(sql_threats)
                risk_score += 40.0
                error_messages.append("SQL injection patterns detected")

            # XSS detection
            xss_threats = await self._detect_xss(input_str)
            if xss_threats:
                threats_detected.extend(xss_threats)
                risk_score += 35.0
                error_messages.append("XSS attack patterns detected")

            # Command injection detection
            cmd_threats = await self._detect_command_injection(input_str)
            if cmd_threats:
                threats_detected.extend(cmd_threats)
                risk_score += 45.0
                error_messages.append("Command injection patterns detected")

            # Path traversal detection
            path_threats = await self._detect_path_traversal(input_str)
            if path_threats:
                threats_detected.extend(path_threats)
                risk_score += 30.0
                error_messages.append("Path traversal patterns detected")

            # LDAP injection detection
            ldap_threats = await self._detect_ldap_injection(input_str)
            if ldap_threats:
                threats_detected.extend(ldap_threats)
                risk_score += 25.0
                error_messages.append("LDAP injection patterns detected")

            # Email injection detection
            email_threats = await self._detect_email_injection(input_str)
            if email_threats:
                threats_detected.extend(email_threats)
                risk_score += 20.0
                error_messages.append("Email injection patterns detected")

            # Field-specific validation
            field_threats = await self._validate_field_specific(input_str, field_type)
            if field_threats:
                threats_detected.extend(field_threats)
                risk_score += 15.0
                error_messages.append(f"Invalid {field_type} format")

            # Sanitize input
            sanitized_input = await self._sanitize_input(input_str, field_type)

            # Determine validation result
            risk_score = min(risk_score, 100.0)

            if risk_score >= 80.0:
                result = ValidationResult.BLOCKED
                is_valid = False
            elif risk_score >= 50.0:
                result = ValidationResult.SUSPICIOUS
                is_valid = False
            elif threats_detected:
                result = ValidationResult.SUSPICIOUS
                is_valid = False
            else:
                result = ValidationResult.VALID
                is_valid = True

            return ValidationAnalysis(
                is_valid=is_valid,
                result=result,
                threats_detected=threats_detected,
                sanitized_input=sanitized_input,
                risk_score=risk_score,
                error_message="; ".join(error_messages) if error_messages else None,
                details={
                    "field_type": field_type,
                    "original_length": len(input_str),
                    "sanitized_length": len(sanitized_input),
                    "context": context or {},
                },
            )

        except Exception as e:
            self.logger.error(
                "Input validation failed",
                input_value=str(input_value)[:100],
                field_type=field_type,
                error=str(e),
            )

            return ValidationAnalysis(
                is_valid=False,
                result=ValidationResult.INVALID,
                threats_detected=[],
                sanitized_input="",
                risk_score=100.0,
                error_message=f"Validation error: {str(e)}",
                details={"validation_error": True},
            )

    async def validate_email(self, email: str) -> ValidationAnalysis:
        """Validate email address with comprehensive security checks."""
        return await self.validate_input(email, "email")

    async def validate_username(self, username: str) -> ValidationAnalysis:
        """Validate username with security patterns."""
        return await self.validate_input(username, "username")

    async def validate_password(self, password: str) -> ValidationAnalysis:
        """Validate password strength and security."""
        analysis = await self.validate_input(password, "password")

        # Additional password-specific validation
        if analysis.is_valid:
            strength_score = await self._assess_password_strength(password)
            analysis.details["password_strength"] = strength_score

            if strength_score < 50:
                analysis.error_message = "Password does not meet strength requirements"
                analysis.is_valid = False
                analysis.result = ValidationResult.INVALID

        return analysis

    async def validate_financial_data(
        self, value: str, data_type: str
    ) -> ValidationAnalysis:
        """Validate financial data (amounts, tickers, identifiers)."""
        analysis = await self.validate_input(value, "general")

        if analysis.is_valid and data_type in self.FINANCIAL_PATTERNS:
            pattern = self.FINANCIAL_PATTERNS[data_type]
            if not re.match(pattern, value):
                analysis.is_valid = False
                analysis.result = ValidationResult.INVALID
                analysis.error_message = f"Invalid {data_type} format"
                analysis.threats_detected.append(ThreatType.INVALID_FORMAT)

        return analysis

    async def sanitize_html(self, html_content: str) -> str:
        """Sanitize HTML content for safe display."""
        try:
            # Basic HTML escaping
            sanitized = html.escape(html_content)

            # Remove dangerous tags
            dangerous_tags = [
                "script",
                "iframe",
                "object",
                "embed",
                "form",
                "link",
                "meta",
                "style",
                "base",
            ]

            for tag in dangerous_tags:
                pattern = f"<\\s*{tag}[^>]*>.*?</\\s*{tag}\\s*>"
                sanitized = re.sub(
                    pattern, "", sanitized, flags=re.IGNORECASE | re.DOTALL
                )

                # Remove self-closing tags
                pattern = f"<\\s*{tag}[^>]*/?>"
                sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)

            # Remove javascript: and similar URLs
            sanitized = re.sub(r"javascript\s*:", "", sanitized, flags=re.IGNORECASE)
            sanitized = re.sub(r"vbscript\s*:", "", sanitized, flags=re.IGNORECASE)
            sanitized = re.sub(
                r"data\s*:\s*text/html", "", sanitized, flags=re.IGNORECASE
            )

            # Remove event handlers
            sanitized = re.sub(
                r'on\w+\s*=\s*["\'][^"\']*["\']', "", sanitized, flags=re.IGNORECASE
            )

            return sanitized

        except Exception as e:
            self.logger.error("HTML sanitization failed", error=str(e))
            return html.escape(html_content)

    async def validate_file_upload(
        self,
        filename: str,
        file_content: bytes,
        allowed_extensions: Optional[Set[str]] = None,
    ) -> ValidationAnalysis:
        """Validate file uploads for security threats."""
        try:
            threats_detected = []
            risk_score = 0.0
            error_messages = []

            # Check filename
            filename_analysis = await self.validate_input(filename, "general")
            if not filename_analysis.is_valid:
                threats_detected.extend(filename_analysis.threats_detected)
                risk_score += filename_analysis.risk_score * 0.3

            # Check file extension
            if allowed_extensions:
                ext = filename.lower().split(".")[-1] if "." in filename else ""
                if ext not in allowed_extensions:
                    threats_detected.append(ThreatType.MALICIOUS_FILE)
                    risk_score += 30.0
                    error_messages.append(f"File extension '{ext}' not allowed")

            # Check for executable file signatures
            dangerous_signatures = [
                b"\x4d\x5a",  # PE executable
                b"\x7f\x45\x4c\x46",  # ELF executable
                b"\xca\xfe\xba\xbe",  # Mach-O executable
                b"\x50\x4b\x03\x04",  # ZIP (could contain executables)
            ]

            for signature in dangerous_signatures:
                if file_content.startswith(signature):
                    threats_detected.append(ThreatType.MALICIOUS_FILE)
                    risk_score += 40.0
                    error_messages.append("Dangerous file signature detected")
                    break

            # Check file size (example: 10MB limit)
            if len(file_content) > 10 * 1024 * 1024:
                threats_detected.append(ThreatType.EXCESSIVE_LENGTH)
                risk_score += 20.0
                error_messages.append("File size exceeds limit")

            # Determine result
            risk_score = min(risk_score, 100.0)
            if risk_score >= 60.0:
                result = ValidationResult.BLOCKED
                is_valid = False
            elif risk_score >= 30.0:
                result = ValidationResult.SUSPICIOUS
                is_valid = False
            else:
                result = ValidationResult.VALID
                is_valid = True

            return ValidationAnalysis(
                is_valid=is_valid,
                result=result,
                threats_detected=threats_detected,
                sanitized_input=filename,
                risk_score=risk_score,
                error_message="; ".join(error_messages) if error_messages else None,
                details={
                    "file_size": len(file_content),
                    "file_extension": filename.split(".")[-1]
                    if "." in filename
                    else "",
                    "allowed_extensions": list(allowed_extensions)
                    if allowed_extensions
                    else [],
                },
            )

        except Exception as e:
            self.logger.error("File validation failed", filename=filename, error=str(e))
            return ValidationAnalysis(
                is_valid=False,
                result=ValidationResult.BLOCKED,
                threats_detected=[ThreatType.MALICIOUS_FILE],
                sanitized_input="",
                risk_score=100.0,
                error_message=f"File validation error: {str(e)}",
            )

    # Private helper methods

    async def _detect_sql_injection(self, input_str: str) -> List[ThreatType]:
        """Detect SQL injection patterns."""
        threats = []
        input_lower = input_str.lower()

        for pattern in self.SQL_PATTERNS:
            if re.search(pattern, input_lower, re.IGNORECASE):
                threats.append(ThreatType.SQL_INJECTION)
                break

        return threats

    async def _detect_xss(self, input_str: str) -> List[ThreatType]:
        """Detect XSS attack patterns."""
        threats = []
        input_lower = input_str.lower()

        for pattern in self.XSS_PATTERNS:
            if re.search(pattern, input_lower, re.IGNORECASE | re.DOTALL):
                threats.append(ThreatType.XSS_ATTACK)
                break

        return threats

    async def _detect_command_injection(self, input_str: str) -> List[ThreatType]:
        """Detect command injection patterns."""
        threats = []

        for pattern in self.COMMAND_PATTERNS:
            if re.search(pattern, input_str, re.IGNORECASE):
                threats.append(ThreatType.COMMAND_INJECTION)
                break

        return threats

    async def _detect_path_traversal(self, input_str: str) -> List[ThreatType]:
        """Detect path traversal patterns."""
        threats = []

        for pattern in self.PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, input_str, re.IGNORECASE):
                threats.append(ThreatType.PATH_TRAVERSAL)
                break

        return threats

    async def _detect_ldap_injection(self, input_str: str) -> List[ThreatType]:
        """Detect LDAP injection patterns."""
        threats = []

        for pattern in self.LDAP_PATTERNS:
            if re.search(pattern, input_str, re.IGNORECASE):
                threats.append(ThreatType.LDAP_INJECTION)
                break

        return threats

    async def _detect_email_injection(self, input_str: str) -> List[ThreatType]:
        """Detect email injection patterns."""
        threats = []

        for pattern in self.EMAIL_PATTERNS:
            if re.search(pattern, input_str, re.IGNORECASE):
                threats.append(ThreatType.EMAIL_INJECTION)
                break

        return threats

    async def _validate_field_specific(
        self, input_str: str, field_type: str
    ) -> List[ThreatType]:
        """Perform field-specific validation."""
        threats = []

        if field_type == "email":
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, input_str):
                threats.append(ThreatType.INVALID_FORMAT)

        elif field_type == "username":
            username_pattern = r"^[a-zA-Z0-9._-]+$"
            if not re.match(username_pattern, input_str):
                threats.append(ThreatType.INVALID_FORMAT)

        return threats

    async def _sanitize_input(self, input_str: str, field_type: str) -> str:
        """Sanitize input based on field type."""
        try:
            # Basic sanitization
            sanitized = input_str.strip()

            # Remove null bytes
            sanitized = sanitized.replace("\x00", "")

            # Field-specific sanitization
            if field_type in ["username", "email"]:
                # Keep only safe characters
                sanitized = re.sub(r"[^\w@._-]", "", sanitized)

            elif field_type in ["name", "description"]:
                # HTML escape for display
                sanitized = html.escape(sanitized)

            elif field_type == "search":
                # Remove dangerous characters for search
                sanitized = re.sub(r'[<>"\';]', "", sanitized)

            return sanitized

        except Exception:
            return ""

    async def _assess_password_strength(self, password: str) -> float:
        """Assess password strength (0-100)."""
        score = 0

        # Length scoring
        if len(password) >= 12:
            score += 25
        elif len(password) >= 8:
            score += 15

        # Character diversity
        if re.search(r"[a-z]", password):
            score += 15
        if re.search(r"[A-Z]", password):
            score += 15
        if re.search(r"[0-9]", password):
            score += 15
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 20

        # Complexity bonus
        if len(set(password)) >= len(password) * 0.7:  # Character uniqueness
            score += 10

        return min(score, 100)
