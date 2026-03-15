import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useAddMessage,
  useCreateSession,
  useGetSessions,
} from "@/hooks/useQueries";
import {
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCopy,
  Code2,
  ExternalLink,
  History,
  ImageIcon,
  Lightbulb,
  Megaphone,
  Menu,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

// ─────────────────────────────────────────────
// Category definitions
// ─────────────────────────────────────────────

type Category =
  | "Writing"
  | "Coding"
  | "Image Generation"
  | "Research"
  | "Marketing"
  | "Creative";

const CATEGORIES: { id: Category; icon: React.ElementType; color: string }[] = [
  { id: "Writing", icon: BookOpen, color: "var(--cat-writing)" },
  { id: "Coding", icon: Code2, color: "var(--cat-coding)" },
  { id: "Image Generation", icon: ImageIcon, color: "var(--cat-image)" },
  { id: "Research", icon: Lightbulb, color: "var(--cat-research)" },
  { id: "Marketing", icon: Megaphone, color: "var(--cat-marketing)" },
  { id: "Creative", icon: Zap, color: "var(--cat-creative)" },
];

// ─────────────────────────────────────────────
// Field state types
// ─────────────────────────────────────────────

interface WritingFields {
  tone: string;
  format: string;
  audience: string;
  length: string;
  topic: string;
}
interface CodingFields {
  language: string;
  task: string;
  complexity: string;
  description: string;
}
interface ImageFields {
  style: string;
  subject: string;
  mood: string;
}
interface ResearchFields {
  topic: string;
  depth: string;
  format: string;
}
interface MarketingFields {
  product: string;
  audience: string;
  goal: string;
  platform: string;
}
interface CreativeFields {
  type: string;
  theme: string;
  style: string;
}

type FieldState = {
  writing: WritingFields;
  coding: CodingFields;
  image: ImageFields;
  research: ResearchFields;
  marketing: MarketingFields;
  creative: CreativeFields;
};

const DEFAULT_FIELDS: FieldState = {
  writing: { tone: "", format: "", audience: "", length: "", topic: "" },
  coding: { language: "", task: "", complexity: "", description: "" },
  image: { style: "", subject: "", mood: "" },
  research: { topic: "", depth: "", format: "" },
  marketing: { product: "", audience: "", goal: "", platform: "" },
  creative: { type: "", theme: "", style: "" },
};

// ─────────────────────────────────────────────
// Prompt assembler
// ─────────────────────────────────────────────

function buildPrompt(category: Category, fields: FieldState): string {
  switch (category) {
    case "Writing": {
      const f = fields.writing;
      const parts: string[] = [];
      if (f.format) parts.push(`Write a ${f.format.toLowerCase()}`);
      else parts.push("Write a piece");
      if (f.topic) parts.push(`about "${f.topic}"`);
      if (f.tone) parts.push(`using a ${f.tone.toLowerCase()} tone`);
      if (f.audience)
        parts.push(`targeted at a ${f.audience.toLowerCase()} audience`);
      if (f.length)
        parts.push(`The length should be ${f.length.toLowerCase()}.`);
      return parts.join(" ");
    }
    case "Coding": {
      const f = fields.coding;
      const parts: string[] = [];
      if (f.task) parts.push(f.task);
      else parts.push("Write");
      if (f.language) parts.push(`${f.language} code`);
      else parts.push("code");
      if (f.description) parts.push(`that ${f.description.toLowerCase()}`);
      if (f.complexity)
        parts.push(
          `Assume a ${f.complexity.toLowerCase()} skill level. Provide clear comments and explanations.`,
        );
      return parts.join(" ");
    }
    case "Image Generation": {
      const f = fields.image;
      const parts: string[] = [];
      if (f.subject) parts.push(f.subject);
      else parts.push("a scene");
      if (f.style) parts.push(`, ${f.style.toLowerCase()} style`);
      if (f.mood) parts.push(`, ${f.mood.toLowerCase()} mood`);
      parts.push(", highly detailed, professional quality");
      return parts.join("");
    }
    case "Research": {
      const f = fields.research;
      const parts: string[] = [];
      if (f.depth) parts.push(`Provide a ${f.depth.toLowerCase()} analysis`);
      else parts.push("Provide an analysis");
      if (f.topic) parts.push(`on the topic: "${f.topic}"`);
      if (f.format)
        parts.push(`Format the response as ${f.format.toLowerCase()}.`);
      return parts.join(" ");
    }
    case "Marketing": {
      const f = fields.marketing;
      const parts: string[] = [];
      if (f.goal) parts.push(`Create a ${f.goal.toLowerCase()} campaign`);
      else parts.push("Create a marketing campaign");
      if (f.product) parts.push(`for ${f.product}`);
      if (f.audience) parts.push(`targeting ${f.audience}`);
      if (f.platform) parts.push(`to be published on ${f.platform}.`);
      parts.push("Be compelling, concise, and on-brand.");
      return parts.join(" ");
    }
    case "Creative": {
      const f = fields.creative;
      const parts: string[] = [];
      if (f.type) parts.push(`Write a ${f.type.toLowerCase()}`);
      else parts.push("Write a creative piece");
      if (f.theme) parts.push(`with the theme: "${f.theme}"`);
      if (f.style) parts.push(`Use a ${f.style.toLowerCase()} writing style.`);
      return parts.join(" ");
    }
    default:
      return "";
  }
}

// ─────────────────────────────────────────────
// Reusable field components
// ─────────────────────────────────────────────

function FieldSelect({
  label,
  ocid,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  ocid: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-ocid={ocid} className="bg-card border-border">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FieldInput({
  label,
  ocid,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  ocid: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <Input
        data-ocid={ocid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-card border-border"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Category field panels
// ─────────────────────────────────────────────

function WritingPanel({
  fields,
  set,
}: {
  fields: WritingFields;
  set: (k: keyof WritingFields, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FieldInput
        label="Topic"
        ocid="promptcraft.topic.input"
        value={fields.topic}
        onChange={(v) => set("topic", v)}
        placeholder="What to write about..."
      />
      <FieldSelect
        label="Tone"
        ocid="promptcraft.tone.select"
        value={fields.tone}
        onChange={(v) => set("tone", v)}
        options={["Formal", "Casual", "Persuasive", "Humorous"]}
        placeholder="Select tone"
      />
      <FieldSelect
        label="Format"
        ocid="promptcraft.format.select"
        value={fields.format}
        onChange={(v) => set("format", v)}
        options={["Essay", "Email", "Blog Post", "Story"]}
        placeholder="Select format"
      />
      <FieldSelect
        label="Audience"
        ocid="promptcraft.audience.select"
        value={fields.audience}
        onChange={(v) => set("audience", v)}
        options={["General", "Expert", "Child", "Business"]}
        placeholder="Select audience"
      />
      <FieldSelect
        label="Length"
        ocid="promptcraft.length.select"
        value={fields.length}
        onChange={(v) => set("length", v)}
        options={["Short", "Medium", "Long"]}
        placeholder="Select length"
      />
    </div>
  );
}

function CodingPanel({
  fields,
  set,
}: {
  fields: CodingFields;
  set: (k: keyof CodingFields, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FieldInput
        label="Description"
        ocid="promptcraft.description.input"
        value={fields.description}
        onChange={(v) => set("description", v)}
        placeholder="Describe the code you need..."
      />
      <FieldSelect
        label="Language"
        ocid="promptcraft.language.select"
        value={fields.language}
        onChange={(v) => set("language", v)}
        options={["Python", "JavaScript", "TypeScript", "Go", "Other"]}
        placeholder="Select language"
      />
      <FieldSelect
        label="Task"
        ocid="promptcraft.task.select"
        value={fields.task}
        onChange={(v) => set("task", v)}
        options={["Write", "Debug", "Explain", "Refactor", "Optimize"]}
        placeholder="Select task"
      />
      <FieldSelect
        label="Complexity"
        ocid="promptcraft.complexity.select"
        value={fields.complexity}
        onChange={(v) => set("complexity", v)}
        options={["Beginner", "Intermediate", "Advanced"]}
        placeholder="Select complexity"
      />
    </div>
  );
}

function ImagePanel({
  fields,
  set,
}: {
  fields: ImageFields;
  set: (k: keyof ImageFields, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <FieldInput
          label="Subject"
          ocid="promptcraft.subject.input"
          value={fields.subject}
          onChange={(v) => set("subject", v)}
          placeholder="Describe what you want to generate..."
        />
      </div>
      <FieldSelect
        label="Style"
        ocid="promptcraft.style.select"
        value={fields.style}
        onChange={(v) => set("style", v)}
        options={[
          "Photorealistic",
          "Cartoon",
          "Oil Painting",
          "Watercolor",
          "3D Render",
        ]}
        placeholder="Select style"
      />
      <FieldSelect
        label="Mood"
        ocid="promptcraft.mood.select"
        value={fields.mood}
        onChange={(v) => set("mood", v)}
        options={["Bright", "Dark", "Moody", "Dreamy", "Epic"]}
        placeholder="Select mood"
      />
    </div>
  );
}

function ResearchPanel({
  fields,
  set,
}: {
  fields: ResearchFields;
  set: (k: keyof ResearchFields, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <FieldInput
          label="Topic"
          ocid="promptcraft.topic.input"
          value={fields.topic}
          onChange={(v) => set("topic", v)}
          placeholder="What do you want to research?"
        />
      </div>
      <FieldSelect
        label="Depth"
        ocid="promptcraft.depth.select"
        value={fields.depth}
        onChange={(v) => set("depth", v)}
        options={["Overview", "Detailed", "Expert"]}
        placeholder="Select depth"
      />
      <FieldSelect
        label="Output Format"
        ocid="promptcraft.format.select"
        value={fields.format}
        onChange={(v) => set("format", v)}
        options={["Summary", "Bullet Points", "Report"]}
        placeholder="Select format"
      />
    </div>
  );
}

function MarketingPanel({
  fields,
  set,
}: {
  fields: MarketingFields;
  set: (k: keyof MarketingFields, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FieldInput
        label="Product / Service"
        ocid="promptcraft.product.input"
        value={fields.product}
        onChange={(v) => set("product", v)}
        placeholder="What are you promoting?"
      />
      <FieldInput
        label="Target Audience"
        ocid="promptcraft.audience.input"
        value={fields.audience}
        onChange={(v) => set("audience", v)}
        placeholder="Who is the audience?"
      />
      <FieldSelect
        label="Goal"
        ocid="promptcraft.goal.select"
        value={fields.goal}
        onChange={(v) => set("goal", v)}
        options={["Awareness", "Conversion", "Retention", "Engagement"]}
        placeholder="Select goal"
      />
      <FieldSelect
        label="Platform"
        ocid="promptcraft.platform.select"
        value={fields.platform}
        onChange={(v) => set("platform", v)}
        options={["Instagram", "Email", "Twitter", "LinkedIn"]}
        placeholder="Select platform"
      />
    </div>
  );
}

function CreativePanel({
  fields,
  set,
}: {
  fields: CreativeFields;
  set: (k: keyof CreativeFields, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FieldSelect
        label="Type"
        ocid="promptcraft.type.select"
        value={fields.type}
        onChange={(v) => set("type", v)}
        options={["Poem", "Short Story", "Screenplay", "Song Lyrics"]}
        placeholder="Select type"
      />
      <FieldInput
        label="Theme"
        ocid="promptcraft.theme.input"
        value={fields.theme}
        onChange={(v) => set("theme", v)}
        placeholder="Love, loss, redemption..."
      />
      <FieldSelect
        label="Style"
        ocid="promptcraft.style.select"
        value={fields.style}
        onChange={(v) => set("style", v)}
        options={["Minimalist", "Descriptive", "Experimental"]}
        placeholder="Select style"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("Writing");
  const [fields, setFields] = useState<FieldState>(DEFAULT_FIELDS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: sessions = [] } = useGetSessions();
  const createSession = useCreateSession();
  const addMessage = useAddMessage();

  const setField = useCallback(
    <K extends keyof FieldState>(category: K) =>
      (key: keyof FieldState[K], value: string) => {
        setFields((prev) => ({
          ...prev,
          [category]: { ...prev[category], [key]: value },
        }));
      },
    [],
  );

  const prompt = useMemo(
    () => buildPrompt(activeCategory, fields),
    [activeCategory, fields],
  );

  const isPromptReady = prompt.length > 10;

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  const handleSave = useCallback(async () => {
    if (!isPromptReady || saving) return;
    setSaving(true);
    try {
      const title = prompt.slice(0, 40);
      const sessionId = await createSession.mutateAsync(title);
      await addMessage.mutateAsync({
        sessionId,
        role: "user",
        content: prompt,
      });
    } finally {
      setSaving(false);
    }
  }, [isPromptReady, saving, prompt, createSession, addMessage]);

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="flex h-full bg-background font-body overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={[
          "fixed lg:relative z-30 lg:z-auto",
          "h-full w-72 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-sidebar-foreground tracking-tight">
              Prompt History
            </span>
          </div>
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-3">
          {sessions.length === 0 ? (
            <div
              data-ocid="promptcraft.history.empty_state"
              className="text-center py-10 text-muted-foreground"
            >
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No prompts saved yet</p>
              <p className="text-xs mt-1 opacity-60">
                Build and save your first prompt
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id.toString()}
                  data-ocid={`promptcraft.history.item.${i + 1}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-all"
                >
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                  <span className="text-sm text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground truncate">
                    {session.title}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-foreground leading-none">
                PromptCraft
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build perfect AI prompts in seconds
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Category selector */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Category
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat, i) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <motion.button
                      type="button"
                      key={cat.id}
                      data-ocid={`promptcraft.category.tab.${i + 1}`}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveCategory(cat.id)}
                      className={[
                        "relative flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left overflow-hidden",
                        isActive
                          ? "border-primary/60 bg-primary/10 text-foreground shadow-glow"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-card/80",
                      ].join(" ")}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="category-bg"
                          className="absolute inset-0 bg-primary/5 rounded-xl"
                        />
                      )}
                      <cat.icon
                        className="w-4 h-4 shrink-0 relative z-10"
                        style={{
                          color: isActive ? "oklch(var(--primary))" : undefined,
                        }}
                      />
                      <span className="relative z-10 leading-tight">
                        {cat.id}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <Separator className="opacity-40" />

            {/* Fields */}
            <AnimatePresence mode="wait">
              <motion.section
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <activeCat.icon className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {activeCategory} Options
                  </p>
                </div>

                {activeCategory === "Writing" && (
                  <WritingPanel
                    fields={fields.writing}
                    set={
                      setField("writing") as (
                        k: keyof WritingFields,
                        v: string,
                      ) => void
                    }
                  />
                )}
                {activeCategory === "Coding" && (
                  <CodingPanel
                    fields={fields.coding}
                    set={
                      setField("coding") as (
                        k: keyof CodingFields,
                        v: string,
                      ) => void
                    }
                  />
                )}
                {activeCategory === "Image Generation" && (
                  <ImagePanel
                    fields={fields.image}
                    set={
                      setField("image") as (
                        k: keyof ImageFields,
                        v: string,
                      ) => void
                    }
                  />
                )}
                {activeCategory === "Research" && (
                  <ResearchPanel
                    fields={fields.research}
                    set={
                      setField("research") as (
                        k: keyof ResearchFields,
                        v: string,
                      ) => void
                    }
                  />
                )}
                {activeCategory === "Marketing" && (
                  <MarketingPanel
                    fields={fields.marketing}
                    set={
                      setField("marketing") as (
                        k: keyof MarketingFields,
                        v: string,
                      ) => void
                    }
                  />
                )}
                {activeCategory === "Creative" && (
                  <CreativePanel
                    fields={fields.creative}
                    set={
                      setField("creative") as (
                        k: keyof CreativeFields,
                        v: string,
                      ) => void
                    }
                  />
                )}
              </motion.section>
            </AnimatePresence>

            <Separator className="opacity-40" />

            {/* Prompt preview */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Live Preview
              </p>
              <div
                data-ocid="promptcraft.prompt_preview"
                className={[
                  "relative rounded-2xl border p-5 min-h-[100px] transition-all",
                  isPromptReady
                    ? "border-primary/40 bg-card shadow-glow"
                    : "border-border bg-card/50",
                ].join(" ")}
              >
                {isPromptReady ? (
                  <motion.p
                    key={prompt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                  >
                    {prompt}
                  </motion.p>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/50">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm italic">
                      Fill in the fields above to generate your prompt...
                    </span>
                  </div>
                )}

                {isPromptReady && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium border border-primary/25">
                      Ready
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Action buttons */}
            <section className="flex flex-wrap gap-3">
              <Button
                data-ocid="promptcraft.copy_button"
                onClick={handleCopy}
                disabled={!isPromptReady}
                variant="outline"
                className="gap-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <ClipboardCopy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Prompt"}
              </Button>

              <Button
                data-ocid="promptcraft.save_button"
                onClick={handleSave}
                disabled={!isPromptReady || saving}
                variant="outline"
                className="gap-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <History className="w-4 h-4" />
                {saving ? "Saving..." : "Save to History"}
              </Button>

              <Button
                data-ocid="promptcraft.chatgpt_button"
                disabled={!isPromptReady}
                asChild={isPromptReady}
                className="gap-2 bg-[oklch(0.72_0.18_145)] hover:bg-[oklch(0.65_0.18_145)] text-white border-0 transition-all"
              >
                {isPromptReady ? (
                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in ChatGPT
                  </a>
                ) : (
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open in ChatGPT
                  </span>
                )}
              </Button>

              <Button
                data-ocid="promptcraft.gemini_button"
                disabled={!isPromptReady}
                asChild={isPromptReady}
                variant="outline"
                className="gap-2 border-border hover:border-blue-400/40 hover:bg-blue-400/5 transition-all"
              >
                {isPromptReady ? (
                  <a
                    href="https://gemini.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Gemini
                  </a>
                ) : (
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open in Gemini
                  </span>
                )}
              </Button>
            </section>

            {/* Bottom spacer */}
            <div className="h-6" />
          </div>
        </div>
      </main>
    </div>
  );
}
