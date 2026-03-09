import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookOpen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [studentCode, setStudentCode] = useState("");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [error, setError] = useState("");

  const goToStudent = () => {
    const trimmed = studentCode.trim();
    if (!trimmed) {
      setError("Please enter your student code.");
      return;
    }

    // You can later change this validation to match
    // whatever scheme you use for student identifiers.
    if (!/^\d+$/.test(trimmed)) {
      setError("Student code should be a number.");
      return;
    }

    setError("");
    navigate(`/student?id=${trimmed}`);
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

        <div className="mx-auto flex max-w-sm flex-col gap-4">
          {!showStudentForm ? (
            <Button
              size="lg"
              className="gap-3 text-base"
              onClick={() => setShowStudentForm(true)}
            >
              <GraduationCap className="h-5 w-5" />
              I&apos;m a Student
            </Button>
          ) : (
            <div className="animate-slide-up flex flex-col gap-2">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter your student code"
                value={studentCode}
                onChange={(e) => {
                  setStudentCode(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && goToStudent()}
              />
              {error && (
                <p className="text-left text-sm text-destructive">{error}</p>
              )}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={goToStudent}>
                  Continue
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowStudentForm(false);
                    setStudentCode("");
                    setError("");
                  }}
                >
                  Back
                </Button>
              </div>
              <p className="text-left text-xs text-muted-foreground">
                Your code is unique to you. Other students never see your
                activity.
              </p>
            </div>
          )}

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
    </div>
  );
};

export default Index;