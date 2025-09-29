import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock, AlertCircle } from "lucide-react";

export function DudaIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">Duda Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite™ SMS alerts to your Duda website
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
            To embed a code widget on a Duda website, you can use the built-in HTML widget. This allows you to add custom HTML, CSS, and JavaScript directly to your pages with a simple drag-and-drop interface.
          </p>
        </CardContent>
      </Card>

      {/* Main Integration Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">Using the HTML Widget</CardTitle>
              <CardDescription className="text-base">
                The built-in HTML widget for adding custom code to your Duda website
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended method</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-sm font-medium">
              This method is perfect for adding Text2MySite™ to any page on your Duda website. The HTML widget supports custom HTML, CSS, and JavaScript code.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Log in to your Duda account and open the website you want to edit.</li>
              <li>In the left-hand panel, click on <strong>Widgets</strong>.</li>
              <li>Scroll down to find the <strong>HTML widget</strong>.</li>
              <li>Drag and drop the HTML widget onto the desired location on your page.</li>
              <li>Click on the HTML widget, and a content editor will appear.</li>
              <li>Paste your embed code into the provided text box.</li>
              <li>Click <strong>Update</strong> or <strong>Apply</strong> to save your changes.</li>
              <li>Preview the page to ensure the widget appears as expected, then click <strong>Publish</strong> to make it live.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            Important Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800">
            <strong>The Duda custom widget builder requires a Custom plan.</strong> If you're using a basic plan, you can still use the HTML widget method described above, but advanced custom widget features may not be available.
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
            Watch step-by-step video guides for Duda integration
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
                <h4 className="font-semibold text-lg mb-2">Duda Custom Widgets in 10 Minutes</h4>
                <p className="text-muted-foreground mb-3">
                  Learn how to create and add custom widgets to your Duda website
                </p>
                <Button asChild size="sm">
                  <a 
                    href="https://www.youtube.com/watch?v=O25DFPWi-L8" 
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
                <h4 className="font-semibold text-lg mb-2">How to Add Videos in Duda</h4>
                <p className="text-muted-foreground mb-3">
                  General guide for adding custom content and widgets to Duda websites
                </p>
                <Button asChild size="sm">
                  <a 
                    href="https://www.youtube.com/watch?v=WYIu-ZFJKeQ" 
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
