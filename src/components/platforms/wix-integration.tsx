import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function WixIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
         
          <div>
            <h1 className="text-4xl font-bold mt-4">Wix Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite SMS alerts to your Wix website
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
            Wix provides a few ways to embed code snippets and widgets, each with a specific purpose. For adding an HTML widget or content that will be visible on your site, you'll use the Embed HTML element (in the Wix Editor) or a Custom Element (in Wix Studio). For invisible tracking or analytics code, you'll use the Custom Code section in your site's dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Main Integration Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">Embed HTML Element</CardTitle>
              <CardDescription className="text-base">
                Ideal for displaying a widget on a page
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for visible widgets</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-pink-800 text-sm font-medium">
              This method is ideal for displaying a widget on a page, such as a weather widget, a calendar, or content from another site.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Add the Element:</strong> In the Wix Editor, go to <strong>"Add Elements"</strong> on the left-hand side, then click <strong>"Embed Code,"</strong> and select <strong>"Embed HTML."</strong> This will add an iFrame to your page.</li>
              <li><strong>Paste the Code:</strong> Click on the iFrame, then click <strong>"Enter Code."</strong> Paste your HTML code snippet into the text box.</li>
              <li><strong>Adjust and Publish:</strong> Resize and position the iFrame on your page as needed. It's important to make sure the iFrame is large enough to display the widget correctly. If the code has fixed pixel dimensions, you might need to adjust them to percentages (e.g., <code>width="100%" height="100%"</code>) to ensure it fits responsively.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}