export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight">T2MS Hosted</h1>
        <p className="mt-3 text-muted-foreground">
          Next.js 15, React 19, Tailwind CSS v4, Prisma, Better Auth, and the
          same UI stack as the main T2MS app. See the <code>docs/</code> folder
          for project documentation.
        </p>
      </div>
    </main>
  )
}
