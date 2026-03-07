import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, BookOpen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<string>("");
  const [showStudentPicker, setShowStudentPicker] = useState(false);

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
          {!showStudentPicker ? (
            <Button
              size="lg"
              className="gap-3 text-base"
              onClick={() => setShowStudentPicker(true)}
            >
              <GraduationCap className="h-5 w-5" />
              I'm a Student
            </Button>
          ) : (
            <div className="animate-slide-up flex gap-3">
              <Select onValueChange={(v) => setStudentId(v)}>
                <SelectTrigger className="flex-1 bg-card">
                  <SelectValue placeholder="Select Student ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Student 1</SelectItem>
                  <SelectItem value="2">Student 2</SelectItem>
                  <SelectItem value="3">Student 3</SelectItem>
                </SelectContent>
              </Select>
              <Button
                disabled={!studentId}
                onClick={() => navigate(`/student?id=${studentId}`)}
              >
                Go
              </Button>
            </div>
          )}

          <Button
            size="lg"
            variant="outline"
            className="gap-3 text-base"
            onClick={() => navigate("/teacher")}
          >
            <BookOpen className="h-5 w-5" />
            I'm a Teacher
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
