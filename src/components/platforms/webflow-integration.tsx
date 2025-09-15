import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock, AlertCircle } from "lucide-react";

export function WebflowIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">Webflow Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite SMS alerts to your Webflow website
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
            Webflow provides robust and flexible options for embedding code, making it a powerful tool for designers and developers alike. You have a choice between adding code to a specific page element or injecting it site-wide.
          </p>
        </CardContent>
      </Card>

      {/* Method 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">The Embed Element (For On-Page Widgets)</CardTitle>
              <CardDescription className="text-base">
                The most common and straightforward method for adding a widget to a specific page
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for specific pages</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              This is the most common and straightforward method for adding a widget to a specific page or section of your design.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>In the Webflow Designer, click the <strong>Add Elements</strong> panel (the plus icon +).</li>
              <li>Scroll down to the <strong>Components</strong> section and find the <strong>Embed</strong> element.</li>
              <li>Drag and drop the <strong>Embed</strong> element onto the canvas where you want your widget to appear.</li>
              <li>A pop-up window will appear with a code editor. Paste your widget's HTML, CSS (wrapped in <code>&lt;style&gt;</code> tags), and JavaScript (wrapped in <code>&lt;script&gt;</code> tags) into this editor.</li>
              <li>Click <strong>Save & Close</strong>.</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800">Important:</h4>
                <p className="text-amber-700 text-sm">
                  For security reasons, the widget will typically not display in the Webflow Designer. You will only see a placeholder that says "Custom Code." To see the live widget, you must click <strong>Publish</strong> in the top-right corner and view your live site.
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
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <CardTitle className="text-2xl">Custom Code in Site Settings (For Site-Wide Scripts)</CardTitle>
              <CardDescription className="text-base">
                For adding scripts that need to be on every page of your site
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For sitewide scripts</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              This method is for adding scripts that need to be on every page of your site, such as analytics trackers, a chatbot, or a global pop-up.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>From the Webflow Designer, click the <strong>Project Settings</strong> icon (the gear icon) in the top-left menu.</li>
              <li>Navigate to the <strong>Custom Code</strong> tab.</li>
              <li>You will see two sections: <strong>Head Code</strong> and <strong>Footer Code</strong>.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  <li><strong>Head Code:</strong> Place code here that needs to load early, like for Google Analytics or other scripts that require a quick page load.</li>
                  <li><strong>Footer Code:</strong> This section is for scripts that can run after the main content of your page has loaded. This is the best place for most widgets like live chats to avoid slowing down your site's initial load time.</li>
                </ul>
              </li>
              <li>Paste your script into the appropriate section and click <strong>Save Changes</strong>.</li>
              <li>Click <strong>Publish</strong> to deploy the code to your live site.</li>
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
            Watch step-by-step video guides for embedding code in Webflow
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
                <h4 className="font-semibold text-lg mb-2">How to Embed Code in Webflow (Easily)</h4>
                <p className="text-muted-foreground mb-3">
                  Quick and clear overview of using the embed element and sitewide custom code
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the Webflow channel
                </p>
                <Button asChild size="sm">
                  <a 
                    href="https://www.youtube.com/watch?v=NhzJy2q4tJc" 
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
                <h4 className="font-semibold text-lg mb-2">How to Add Custom Code in Webflow – JavaScript, CSS & More!</h4>
                <p className="text-muted-foreground mb-3">
                  In-depth guide covering different scenarios for adding custom code
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the Derek Sue channel
                </p>
                <Button asChild size="sm">
                  <a 
                    href="https://www.youtube.com/watch?v=nT8C0EMusEs" 
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