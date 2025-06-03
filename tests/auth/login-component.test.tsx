import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import Login from "../../src/pages/auth/Login";
import { AuthProvider } from "../../src/contexts/AuthContext";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Mock window.location
const mockLocation = {
  href: "",
  pathname: "/auth/login",
  state: null,
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock useLocation hook
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

const renderLoginWithProviders = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe("Login Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
    mockLocation.pathname = "/auth/login";

    // Setup axios defaults mock
    mockedAxios.defaults = {
      withCredentials: true,
      baseURL: "http://localhost:8000",
    } as any;

    // Setup useLocation mock
    mockUseLocation.mockReturnValue({
      pathname: "/auth/login",
      state: null,
    });
  });

  describe("Component Rendering", () => {
    it("should render login form with all required fields", () => {
      renderLoginWithProviders();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it("should render navigation links", () => {
      renderLoginWithProviders();

      expect(
        screen.getByText(/don't have an account\? sign up/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/stockpulse/i)).toBeInTheDocument();
    });

    it("should render password visibility toggle", () => {
      renderLoginWithProviders();

      const passwordField = screen.getByLabelText(/password/i);
      expect(passwordField).toHaveAttribute("type", "password");

      // Look for the eye icon button (password toggle)
      const toggleButtons = screen.getAllByRole("button");
      const toggleButton = toggleButtons.find(
        (button) =>
          button.querySelector("svg") &&
          button !== screen.getByRole("button", { name: /sign in/i }),
      );
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("should allow typing in email and password fields", async () => {
      renderLoginWithProviders();

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(emailField, "admin@sp.com");
      await user.type(passwordField, "admin@123");

      expect(emailField).toHaveValue("admin@sp.com");
      expect(passwordField).toHaveValue("admin@123");
    });

    it("should require email and password fields", async () => {
      renderLoginWithProviders();

      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.click(submitButton);

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);

      expect(emailField).toBeInvalid();
      expect(passwordField).toBeInvalid();
    });
  });

  describe("Form Submission", () => {
    it("should successfully submit login form with valid credentials", async () => {
      const mockUser = {
        id: "1",
        email: "admin@sp.com",
        name: "Admin User",
        role: ["ADMIN"],
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { user: mockUser },
      });

      renderLoginWithProviders();

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailField, "admin@sp.com");
      await user.type(passwordField, "admin@123");

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/auth/login", {
          email: "admin@sp.com",
          password: "admin@123",
        });
      });

      await waitFor(() => {
        expect(mockLocation.href).toBe("/dashboard");
      });
    });

    it("should display error message on login failure", async () => {
      const mockError = {
        response: {
          data: {
            detail: "Invalid credentials",
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      renderLoginWithProviders();

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailField, "admin@sp.com");
      await user.type(passwordField, "wrongpassword");

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockedAxios.post.mockReturnValueOnce(controlledPromise as any);

      renderLoginWithProviders();

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailField, "admin@sp.com");
      await user.type(passwordField, "admin@123");

      await act(async () => {
        await user.click(submitButton);
      });

      // Check loading state
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();

      // Resolve the promise
      act(() => {
        resolvePromise!({
          data: {
            user: {
              id: "1",
              email: "admin@sp.com",
              name: "Admin User",
              role: ["ADMIN"],
            },
          },
        });
      });

      await waitFor(() => {
        expect(mockLocation.href).toBe("/dashboard");
      });
    });

    it("should handle network errors gracefully", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.post.mockRejectedValueOnce(networkError);

      renderLoginWithProviders();

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailField, "admin@sp.com");
      await user.type(passwordField, "admin@123");

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to register page when clicking sign up link", async () => {
      renderLoginWithProviders();

      const signUpLink = screen.getByText(/don't have an account\? sign up/i);

      await user.click(signUpLink);

      expect(mockNavigate).toHaveBeenCalledWith("/auth/register");
    });

    it("should navigate to home when clicking logo", async () => {
      renderLoginWithProviders();

      const logoLink = screen.getByRole("link", { name: /stockpulse/i });

      await user.click(logoLink);

      // The logo should navigate to home page
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      renderLoginWithProviders();

      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "type",
        "email",
      );
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        "type",
        "password",
      );
      expect(screen.getByRole("button", { name: /sign in/i })).toHaveAttribute(
        "type",
        "submit",
      );
    });

    it("should be keyboard navigable", async () => {
      renderLoginWithProviders();

      const emailField = screen.getByLabelText(/email address/i);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // Tab through form elements
      await user.tab();
      expect(emailField).toHaveFocus();

      await user.tab();
      expect(passwordField).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});
