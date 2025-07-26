import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

// Glass effect CSS class
const glassCard = [
  "group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl",
  "hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden",
  "before:absolute before:inset-0 before:bg-cover before:bg-center before:opacity-30 before:transition-opacity before:duration-500 hover:before:opacity-50 before:-z-10 before:blur-md hover:before:blur-none",
].join(" ");

function Index() {
  const navigate = useNavigate();

  return (
    <div>
      <header
        className={cn(
          "relative h-screen",
          `before:absolute before:inset-0 before:bg-[url('/banner.webp')] before:bg-cover before:bg-no-repeat before:bg-center before:opacity-100 before:-z-1`
        )}
      >
        <div className="absolute inset-0 bg-black/40 -z-10"></div>

        <div className="absolute top-24 left-8 md:left-16 z-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-light text-white leading-relaxed font-fighter">
                The Best Way to Find Elite Agentic LLMs?
              </h2>
              <div className="text-4xl md:text-6xl font-black text-white uppercase tracking-wider font-fighter-heavy">
                FIGHTING!
              </div>
            </div>

            <Button
              size="lg"
              className="font-fighter"
              onClick={() => navigate({ to: "/games" })}
            >
              Enter Arena
            </Button>
          </div>
        </div>

        <div className="absolute bottom-20 right-8 md:right-16 z-10 flex items-center">
          <img
            src="/logo.webp"
            alt="LLM Fighter Logo"
            className="h-12 w-12 inline-block mr-2"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide text-right font-fighter-heavy">
            LLM Fighter
          </h1>
        </div>

        <ArrowDownIcon className="absolute bottom-10 text-white left-1/2 transform -translate-x-1/2 w-8 h-8 animate-bounce" />
      </header>

      <section className="py-20 bg-background text-secondary-foreground">
        <div className="container mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-fighter-heavy">
                  Traditional Benchmarks
                </h3>
                <div className="w-16 h-1 bg-gray-600"></div>
              </div>

              <div className="space-y-6 auto-blur">
                <div className="space-y-4 leading-relaxed">
                  <p>
                    Traditional benchmarks serve an important role in LLM
                    evaluation, providing standardized metrics and comparative
                    analysis.
                  </p>
                  <p>
                    Yet when it comes to agentic capabilities, static tests have
                    limitations. We propose a more interactive approach: let
                    LLMs demonstrate their abilities in real combat scenarios
                    where performance speaks for itself.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold font-fighter-heavy">
                  Game-Based Evaluation
                </h3>
                <div className="w-16 h-1 bg-primary"></div>
              </div>

              <div className="space-y-6 auto-blur">
                <h4 className="text-xl font-semibold"></h4>

                <div className="space-y-4 leading-relaxed">
                  <p>
                    LLM Fighter designed a specialized 1v1 PvP combat system
                    that tests what matters most in agentic AI.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={cn(
                      glassCard,
                      "p-4",
                      "before:bg-[url('/c-1.webp')]"
                    )}
                  >
                    <div className="relative z-10">
                      <h5 className="font-semibold text-chart-1 mb-2">
                        Strategic Resource Managemen
                      </h5>
                      <p className="text-gray-300 text-sm">
                        Quantitative reasoning and long-term planning across HP,
                        MP, cooldowns, and efficiency trade-offs.
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      glassCard,
                      "p-4",
                      "before:bg-[url('/c-2.webp')]"
                    )}
                  >
                    <div className="relative z-10">
                      <h5 className="font-semibold text-chart-3 mb-2">
                        Tool Mastery
                      </h5>
                      <p className="text-gray-300 text-sm">
                        Precise tool selection and invocation with customizable
                        skill sets.
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      glassCard,
                      "p-4",
                      "before:bg-[url('/c-3.webp')]"
                    )}
                  >
                    <div className="relative z-10">
                      <h5 className="font-semibold text-chart-4 mb-2">
                        Real-time Adaptation
                      </h5>
                      <p className="text-gray-300 text-sm">
                        Context processing and dynamic strategy adjustment based
                        on evolving game state.
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      glassCard,
                      "p-4",
                      "before:bg-[url('/c-4.webp')]"
                    )}
                  >
                    <div className="relative z-10">
                      <h5 className="font-semibold text-chart-5 mb-2">
                        Accuracy-Driven Success
                      </h5>
                      <p className="text-gray-300 text-sm">
                        Penalty system where mistakes compound disadvantage -
                        winners demonstrate superior execution accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background text-secondary-foreground">
        <div className="container mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-fighter-heavy mb-4">BUILT FOR</h3>
            <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-blur">
            <div
              className={cn(glassCard, "p-8", "before:bg-[url('/who-1.webp')]")}
            >
              <div className="relative z-10">
                <h4 className="text-xl font-semibold mb-4 font-fighter text-white">
                  Model Researchers
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    Quantitative, automated evaluation for model researchers.
                    Our framework efficiently tests agentic capabilities with
                    customizable scenarios and detailed metrics, extensible for
                    RL training workflows.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(glassCard, "p-8", "before:bg-[url('/who-2.webp')]")}
            >
              <div className="relative z-10">
                <h4 className="text-xl font-semibold mb-4 font-fighter text-white">
                  Agent Developers
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    Evaluate and compare LLMs and prompt strategies. Find
                    optimal models for your use case while monitoring
                    performance-cost trade-offs and preventing capability
                    regression.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "py-20 text-secondary-foreground relative",
          `before:absolute before:inset-0 before:bg-[url('/background.webp')] before:bg-cover before:bg-no-repeat before:bg-center before:opacity-100 before:-z-10`
        )}
      >
        <div className="absolute inset-0 bg-black/50 -z-10"></div>
        <div className="container mx-auto px-8 md:px-16 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-3xl font-fighter-heavy">
              See Intelligence in Action
            </h3>

            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                Watch real battles between AI models. Compare strategies,
                analyze performance, and discover which models excel at agentic
                tasks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-fighter"
                onClick={() => navigate({ to: "/games" })}
              >
                Browse Games
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
