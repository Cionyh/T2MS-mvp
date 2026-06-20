import Link from "next/link"
import { getDemoExamples, hostedPublicUrl } from "@/lib/demo-examples"
import { getHostedPageDomain } from "@/lib/hosted-page/constants"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExternalLink, Megaphone } from "lucide-react"

export const metadata = {
  title: "T2MS Live Announcements — Demo",
  description:
    "See hosted announcement pages on t2ms.live — no login required to view.",
}

export default function DemoPage() {
  const examples = getDemoExamples()
  const domain = getHostedPageDomain()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-700">T2MS Version 1</p>
            <h1 className="text-2xl font-bold tracking-tight">
              Hosted announcement pages
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Share a live link like <span className="font-mono">yourname.{domain}</span> — no widget install required.
            </p>
          </div>
          <Button asChild className="!bg-amber-600 hover:!bg-amber-700 shrink-0">
            <Link href="/onboarding">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <Card className="border-amber-600/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-600" />
              Primary demo
            </CardTitle>
            <CardDescription>
              Open a live hosted page (updates when the account posts announcements).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <a
                href={hostedPublicUrl(examples[0]?.slug ?? "demo-church")}
                target="_blank"
                rel="noopener noreferrer"
              >
                View {examples[0]?.label ?? "demo"}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-lg font-semibold mb-4">Example pages</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {examples.map((ex) => (
              <Card key={ex.slug}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{ex.label}</CardTitle>
                  <CardDescription className="text-sm">{ex.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-mono text-muted-foreground mb-3 break-all">
                    {hostedPublicUrl(ex.slug)}
                  </p>
                  <Button asChild size="sm" variant="secondary" className="gap-2">
                    <a
                      href={hostedPublicUrl(ex.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open page
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center">
          Demo pages{" "}
          <code className="bg-muted px-1 rounded">demo-church</code> and{" "}
          <code className="bg-muted px-1 rounded">demo-business</code> work out of
          the box. Override with{" "}
          <code className="bg-muted px-1 rounded">NEXT_PUBLIC_DEMO_HOSTED_SLUGS</code>{" "}
          for custom live demo accounts.
        </p>
      </main>
    </div>
  )
}
