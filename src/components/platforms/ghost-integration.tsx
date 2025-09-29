import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function GhostIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">Ghost Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite™ SMS alerts to your Ghost website
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
            Ghost makes it easy to add custom code with its built-in features. There are two primary methods for embedding code or widgets.
          </p>
        </CardContent>
      </Card>

      {/* Method 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">Site-Wide Code Injection</CardTitle>
              <CardDescription className="text-base">
                Best method for adding code that needs to appear on every page of your site
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for sitewide widgets</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              This is the best method for adding code that needs to appear on every page of your site, such as a Google Analytics tracking script, a social media pixel, or a live chat widget.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>From your Ghost admin dashboard, navigate to <strong>Settings → Code injection</strong>.</li>
              <li>You will see two sections: <strong>Site Header</strong> and <strong>Site Footer</strong>.</li>
              <li><strong>Site Header:</strong> Place code here that needs to load early on the page. This is ideal for analytics scripts and external CSS stylesheets.</li>
              <li><strong>Site Footer:</strong> Place code here that can load later, typically at the very end of the page body. This is a good location for chat widgets or other JavaScript that isn't critical for the initial page load.</li>
              <li>After pasting your code, click the <strong>Save</strong> button in the top right corner. The code will now be live on all pages of your site.</li>
            </ol>
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
              <CardTitle className="text-2xl">Embed Code in a Post or Page</CardTitle>
              <CardDescription className="text-base">
                For adding a specific widget to a single piece of content
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For specific posts/pages</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              For adding a specific widget (like a YouTube video, a form, or a Spotify playlist) to a single piece of content, use the HTML card in the editor.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>While editing a post or page, click the plus icon <strong>(+)</strong> to add a new card.</li>
              <li>Scroll down and select the <strong>HTML card</strong>.</li>
              <li>Paste your embed code (e.g., the <code>&lt;iframe&gt;</code> or <code>&lt;script&gt;</code> provided by the widget creator) directly into the card.</li>
              <li>The editor will render a preview of the widget.</li>
              <li>Once you are finished, save or publish your post.</li>
            </ol>
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
            Watch step-by-step video guides for adding code to Ghost
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
                <h4 className="font-semibold text-lg mb-2">Embed A Forum Into Your Ghost Website</h4>
                <p className="text-muted-foreground mb-3">
                  Guide for embedding custom content and widgets into Ghost websites
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the channel Website Toolbox • 1 minute 29 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=iq-Pz4dYYFo" 
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
                <h4 className="font-semibold text-lg mb-2">Embed A Chat Room Into Your Ghost Website</h4>
                <p className="text-muted-foreground mb-3">
                  Tutorial for embedding interactive widgets and custom code in Ghost
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the channel Website Toolbox • 1 minute 25 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=-TwHLUaS8nI" 
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
