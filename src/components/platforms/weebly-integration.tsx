import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function WeeblyIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
         
          <div>
            <h1 className="text-4xl font-bold mt-4">Weebly Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite SMS alerts to your Weebly website
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Clock className="w-3 h-3 mr-1" />
          Setup time: 2-3 minutes
        </Badge>
      </div>

      {/* Introduction */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Embedding code on a Weebly website is very straightforward using the Embed Code element. This method is the primary way to add a third-party widget, such as a contact form, social media feed, or a video that isn't from YouTube or Vimeo.
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
              <CardTitle className="text-2xl">Using the Embed Code Element</CardTitle>
              <CardDescription className="text-base">
                The primary way to add third-party widgets to your Weebly site
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Primary method</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-sm font-medium">
              This is the primary way to add a third-party widget, such as a contact form, social media feed, or a video that isn't from YouTube or Vimeo.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>From the Weebly editor, navigate to the <strong>Build</strong> tab on the top menu.</li>
              <li>In the left-hand sidebar, scroll down until you find the <strong>Embed Code</strong> element. It is typically found under the "Basic" section.</li>
              <li>Drag and drop the <strong>Embed Code</strong> element onto your page where you want the widget to appear. A box will appear saying "Click to set custom HTML."</li>
              <li>Click inside the box, and then click <strong>Edit Custom HTML</strong>.</li>
              <li>A text field will appear. Paste your full embed code (including the <code>&lt;script&gt;</code> or <code>&lt;iframe&gt;</code> tags) into this field.</li>
              <li>Click outside the element to save the code. The widget may appear immediately in the editor, but in some cases, it will only render after you Publish your site.</li>
              <li>Once you're satisfied with the placement, click the <strong>Publish</strong> button in the top right corner to make the changes live on your website.</li>
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
            Watch step-by-step video guides for embedding code in Weebly
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
                <h4 className="font-semibold text-lg mb-2">How to Add HTML Code to Weebly Website</h4>
                <p className="text-muted-foreground mb-3">
                  Quick and easy way to use the embed code element
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the How To 1 Minute channel
                </p>
                <Button asChild size="sm">
                  <a 
                    href="https://www.youtube.com/watch?v=ptgPyJ6t1uc" 
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
                <h4 className="font-semibold text-lg mb-2">Weebly How to Use the Embed Code with Example Using Google Forms</h4>
                <p className="text-muted-foreground mb-3">
                  Great real-world example of embedding a Google Form into a Weebly site
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the Shara-Maree channel
                </p>
                <Button asChild size="sm">
                  <a 
                    href="https://www.youtube.com/watch?v=jiusSJNxiDg" 
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
