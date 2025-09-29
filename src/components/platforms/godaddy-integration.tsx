import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function GoDaddyIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">GoDaddy Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite™ SMS alerts to your GoDaddy website
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
            Adding code or a widget to a GoDaddy website is a straightforward process, thanks to its built-in HTML section. This is the primary method for adding third-party content like a booking calendar, a social media feed, or a contact form that isn't native to the builder.
          </p>
        </CardContent>
      </Card>

      {/* Main Integration Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">How to Embed a Widget on GoDaddy</CardTitle>
              <CardDescription className="text-base">
                Using the built-in HTML section to add custom widgets
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Primary method</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              This is the primary method for adding third-party content like booking calendars, social media feeds, or contact forms that aren't native to the GoDaddy builder.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Log in to your GoDaddy account and open the <strong>Websites + Marketing</strong> dashboard.</li>
              <li>Click <strong>Edit Website</strong> to open the site editor.</li>
              <li>Navigate to the page and location where you want to add the widget.</li>
              <li>Click the plus sign <strong>(+)</strong> where you want to insert the content, then select the <strong>HTML section</strong> from the menu.</li>
              <li>A new section will be added to your page. In the right-hand panel, click into the <strong>Custom Code</strong> field.</li>
              <li>Paste your entire widget code (including any <code>&lt;script&gt;</code> or <code>&lt;iframe&gt;</code> tags) into this box.</li>
              <li>The widget should display in the editor. You can use the <strong>Settings</strong> tab in the right-hand panel to adjust the height of the container if the widget gets cut off.</li>
              <li>Once you are happy with the placement and appearance, click <strong>Done</strong> and then <strong>Publish</strong> to make the changes live on your site.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Additional Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            For scripts like Google Analytics or Facebook Pixel that need to be on every page, GoDaddy has a dedicated field in your site's settings, so you don't need to use the HTML section for them.
          </p>
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
            Watch step-by-step video guides for adding custom HTML to GoDaddy
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
                <h4 className="font-semibold text-lg mb-2">How to Embed on Godaddy Website Builder</h4>
                <p className="text-muted-foreground mb-3">
                  Comprehensive guide for embedding widgets and custom code in GoDaddy
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the channel Tutorials by Joe & Lisa • 3 minutes 46 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=7CI5wz7ir0U" 
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
                <h4 className="font-semibold text-lg mb-2">How To Add HTML Code To GoDaddy Website Builder</h4>
                <p className="text-muted-foreground mb-3">
                  Step-by-step tutorial for adding HTML code to GoDaddy websites
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the channel Make Money Anthony • 2 minutes 45 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=IYqVERymJ5k" 
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
