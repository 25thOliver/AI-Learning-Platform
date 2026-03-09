import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookOpen } from "lucide-react";
import { api } from "@/lib/api";

type Mode = "signin" | "signup";

const Index = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");

  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("ls_email");
    if (saved) {
      setEmail(saved);
    }
  }, []);

  const resetForm = () => {
    setFirstName("");
    setSecondName("");
    setEmail("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (mode === "signup" && (!firstName.trim() || !secondName.trim())) {
      setError("Please enter your first and last name.");
      return;
    }

    try {
      setLoading(true);
      let student;

      if (mode === "signup") {
        student = await api.signupStudent({
          first_name: firstName.trim(),
          second_name: secondName.trim(),
          email: email.trim(),
        });
      } else {
        student = await api.loginStudent({ email: email.trim() });
      }

      window.localStorage.setItem("ls_email", student.email);
      navigate(`/student?id=${student.id}`);
    } catch (err: any) {
      if (mode === "signin" && err?.message?.includes("404")) {
        setError("We couldn't find an account with that email. Try signing up.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
          <BookOpen className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          LearnSmart AI
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          Personalized learning, powered by artificial intelligence
        </p>

        <div className="mx-auto mb-6 flex max-w-sm flex-col gap-3 rounded-xl bg-card p-5 card-shadow">
          <div className="mb-2 flex items-center justify-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-card-foreground">
              Student access
            </span>
          </div>

          <div className="flex rounded-lg bg-muted p-1 text-xs font-medium">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 transition ${
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 transition ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              Sign up
            </button>
          </div>

          {mode === "signup" && (
            <div className="flex gap-2">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last name"
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
              />
            </div>
          )}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
          />

          {error && (
            <p className="text-left text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Continue"
                : "Create account"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          <p className="mt-1 text-left text-xs text-muted-foreground">
            Your learning history is private to your account. Teachers only see
            aggregated analytics.
          </p>
        </div>

        <Button
          size="lg"
          variant="outline"
          className="gap-3 text-base"
          onClick={() => navigate("/teacher")}
        >
          <BookOpen className="h-5 w-5" />
          I&apos;m a Teacher
        </Button>
      </div>
    </div>
  );
};

export default Index;