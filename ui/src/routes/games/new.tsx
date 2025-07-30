import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/game/api";
import { v1Config } from "@/lib/game/config";
import { useApiKeyStore } from "@/lib/api-key-manager";

export const Route = createFileRoute("/games/new")({
  component: RouteComponent,
});

const agentConfigSchema = z.object({
  baseURL: z
    .string()
    .url("Please enter a valid URL")
    .describe("The base URL of the LLM API"),
  apiKey: z
    .string()
    .min(1, "API key is required")
    .describe("Your API key for the LLM service"),
  name: z
    .string()
    .min(1, "Agent name is required")
    .describe("The name of the agent"),
  model: z
    .string()
    .min(1, "Model name is required")
    .describe("The model name to use"),
  systemPrompt: z
    .string()
    .optional()
    .describe("Custom system prompt for the agent"),
});

const formSchema = z.object({
  p1: agentConfigSchema,
  p2: agentConfigSchema,
});

type FormData = z.infer<typeof formSchema>;
type AgentConfig = z.infer<typeof agentConfigSchema>;

const defaultAgentConfig: AgentConfig = {
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "",
  name: "",
  model: "",
  systemPrompt: v1Config.systemPrompt,
};

function AgentConfigSection({
  playerKey,
  title,
  form,
}: {
  playerKey: keyof FormData;
  title: string;
  form: ReturnType<typeof useForm<FormData>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={`${playerKey}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Claude Sonnet 4" {...field} />
              </FormControl>
              <FormDescription>Display name for this agent</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${playerKey}.baseURL`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.openai.com/v1" {...field} />
              </FormControl>
              <FormDescription>OpenAI-compatible API endpoint</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${playerKey}.apiKey`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="sk-..." {...field} />
              </FormControl>
              <FormDescription>
                Your API key (sent directly from browser, not stored)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${playerKey}.model`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., anthropic/claude-sonnet-4"
                  {...field}
                />
              </FormControl>
              <FormDescription>Model identifier for the API</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${playerKey}.systemPrompt`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Custom instructions for the agent..."
                  rows={8}
                  className="field-sizing-fixed"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Custom system prompt to override default battle instructions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      p1: { ...defaultAgentConfig },
      p2: { ...defaultAgentConfig },
    },
  });

  const navigate = useNavigate();
  const { setApiKeys } = useApiKeyStore();

  const { mutate, isPending } = useMutation({
    mutationKey: ["games"],
    mutationFn: async (values: FormData) => {
      // keep API keys in the client-side
      const p1Key = values.p1.apiKey;
      const p2Key = values.p2.apiKey;
      values.p1.apiKey = "*";
      values.p2.apiKey = "*";

      const game = await api.createGame({
        gameConfig: v1Config.gameConfig,
        p1Config: values.p1,
        p2Config: values.p2,
        winner: null,
        logs: [],
        violationLogs: [],
        tokenLogs: [],
        public: true,
        featured: false,
      });

      setApiKeys(game.id, {
        p1Key,
        p2Key,
      });

      navigate({ to: `/games/${game.id}` });
    },
  });

  function onSubmit(values: FormData) {
    mutate(values);
  }

  return (
    <div className="bg-background pt-[80px] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <blockquote className="pl-4 border-l-4 border-primary bg-muted/50 p-4 rounded-r-md text-foreground">
            <p className="mb-2 text-sm">
              <strong>Requirements:</strong> Both agents must use
              OpenAI-compatible APIs with tool calling support and CORS enabled.
            </p>
            <p className="text-sm">
              <strong>Security:</strong> Your API keys are sent directly from
              your browser to the specified endpoints and are never stored on
              our servers.
            </p>
          </blockquote>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <AgentConfigSection playerKey="p1" title="Player 1" form={form} />

              <AgentConfigSection playerKey="p2" title="Player 2" form={form} />
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isPending}
                className="font-fighter"
              >
                {isPending ? "Creating Battle..." : "Start Battle"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
