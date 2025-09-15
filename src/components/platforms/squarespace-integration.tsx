import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock, AlertCircle } from "lucide-react";

export function SquarespaceIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">Squarespace Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite SMS alerts to your Squarespace website
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Clock className="w-3 h-3 mr-1" />
          Setup time: 3-5 minutes
        </Badge>
      </div>

      {/* Introduction */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Squarespace provides a couple of primary methods for embedding code or widgets, depending on your needs. The most common and user-friendly way is to use a Code Block, but for site-wide scripts, you'll need to use Code Injection.
          </p>
        </CardContent>
      </Card>

      {/* Method 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">Using the Code Block</CardTitle>
              <CardDescription className="text-base">
                Perfect for embedding a widget on a specific page or blog post
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for specific pages</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 text-sm font-medium">
              This method is perfect for embedding a widget on a specific page, blog post, or in a footer area. It's the go-to option for things like social media feeds, third-party forms, or interactive maps.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Add a Code Block:</strong> While editing a page or post, click on an insertion point (the + icon) to add a new content block.</li>
              <li><strong>Select "Code":</strong> From the menu that appears, scroll down and select the <strong>Code</strong> block.</li>
              <li><strong>Paste Your Code:</strong> Click the pencil icon on the code block to open the editor. Paste your widget's HTML, JavaScript, or CSS code into the text field.</li>
              <li><strong>Important:</strong> By default, the type is set to HTML. For CSS, you should wrap your code in <code>&lt;style&gt;&lt;/style&gt;</code> tags. For JavaScript, wrap it in <code>&lt;script&gt;&lt;/script&gt;</code> tags.</li>
              <li><strong>Save and Preview:</strong> Click <strong>"Apply"</strong> to save the code block. Your widget will often not render in the editor itself for security reasons. To see it, save the page and view it live.</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800">Note on Plans:</h4>
                <p className="text-amber-700 text-sm">
                  Functional JavaScript is only supported on Business and Commerce plans or higher. If you have a Personal plan, the code block will not execute JavaScript, but it will work for simple HTML and CSS.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <CardTitle className="text-2xl">Using Code Injection (Advanced)</CardTitle>
              <CardDescription className="text-base">
                For adding code snippets that need to load on every page of your site
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For sitewide scripts</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              This method is for adding code snippets that need to load on every page of your site. This is typically used for tracking pixels, analytics scripts, or custom CSS/JavaScript that affects your entire site's design or functionality.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Access Code Injection:</strong> From your Squarespace dashboard, go to <strong>Settings → Advanced → Code Injection</strong>.</li>
              <li><strong>Choose Header or Footer:</strong> You'll see fields for Header and Footer.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  <li><strong>Header:</strong> Code placed here loads before the page content. This is the ideal spot for analytics scripts like Google Analytics or Facebook Pixel.</li>
                  <li><strong>Footer:</strong> Code placed here loads after the page content. This is a good place for live chat widgets or scripts that don't need to load immediately to avoid slowing down your site's initial load time.</li>
                </ul>
              </li>
              <li><strong>Paste and Save:</strong> Paste your code into the appropriate field and click <strong>"Save."</strong></li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Limitations and Considerations */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            Limitations and Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-amber-800">Support:</h4>
            <p className="text-amber-700 text-sm">
              Squarespace's customer support does not provide assistance with custom code. If you encounter issues, you may need to troubleshoot on your own, use the Squarespace Forum, or hire a Squarespace Expert.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800">Security:</h4>
            <p className="text-amber-700 text-sm">
              Always ensure that the code you're embedding is from a trusted source to prevent security risks to your website.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800">Previewing:</h4>
            <p className="text-amber-700 text-sm">
              As a security measure, some embedded code will not be visible to you when you are logged into your Squarespace account. To test if the code is working, you will need to log out or view your site in an incognito window.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800">Plan Requirements:</h4>
            <p className="text-amber-700 text-sm">
              As mentioned above, some features like JavaScript in a Code Block require a Business plan or higher.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video Tutorials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            YouTube Tutorials
          </CardTitle>
          <CardDescription>
            Watch step-by-step video guides for embedding code in Squarespace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tutorial 1 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Adding Custom Code | Squarespace 7.1</h4>
                <p className="text-muted-foreground mb-3">
                  Official Squarespace guide for adding custom code
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the Squarespace Help channel • 2 minutes 34 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=s3oscHXEY44" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Watch Tutorial
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Tutorial 2 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">How To Embed Code Squarespace Tutorial</h4>
                <p className="text-muted-foreground mb-3">
                  Step-by-step tutorial for embedding code in Squarespace
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the Blooming channel • 2 minutes 7 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=ZIuHJj6QM5E" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Watch Tutorial
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Tutorial 3 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">How To Embed A Code In Squarespace (2025)</h4>
                <p className="text-muted-foreground mb-3">
                  Quick and updated guide for 2025
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the Skill Savvy channel • 1 minute 8 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=NkTj5Ae3I94" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Watch Tutorial
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
