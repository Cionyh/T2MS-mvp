import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function HtmlIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">HTML5 Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite SMS alerts to your HTML5 website
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
            Adding Text2MySite to an HTML5 website is straightforward. Simply place the script tag in your HTML file and upload it to your web server.
          </p>
        </CardContent>
      </Card>

      {/* Step 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">Place the Script Tag</CardTitle>
              <CardDescription className="text-base">
                Copy the script tag and place it just before the closing &lt;/head&gt; tag
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm font-medium">
              This is a best practice as it allows the rest of your page content to load before the script runs, which improves page speed.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
              <code>{`<head>
  <!-- Your existing head content -->
  <script>
    // Your Text2MySite script here
  </script>
</head>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Step 2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <CardTitle className="text-2xl">Save and Upload</CardTitle>
              <CardDescription className="text-base">
                Save the HTML file and upload it to your web server
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm font-medium">
              If you are editing the file locally, you will need to upload the updated file to your web server using FTP or your hosting provider's file manager to make the changes live.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Upload Methods:</h4>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li><strong>FTP Client:</strong> Use FileZilla, WinSCP, or similar FTP software</li>
              <li><strong>File Manager:</strong> Use your hosting provider's web-based file manager</li>
              <li><strong>Git:</strong> If using version control, commit and push your changes</li>
              <li><strong>cPanel:</strong> Use the File Manager in your hosting control panel</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Video Tutorial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            YouTube Tutorial
          </CardTitle>
          <CardDescription>
            Watch a step-by-step video guide for embedding widgets in HTML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="font-semibold text-lg mb-2">How to Embed a Widget in HTML | Simple Step-by-Step Guide</h4>
            <p className="text-muted-foreground mb-2">
              Visual guide covering widget embedding in static HTML files
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              From the channel Elfsight
            </p>
            <Button asChild>
              <a 
                href="https://www.youtube.com/watch?v=3-V1t69w1xY" 
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
        </CardContent>
      </Card>
    </div>
  );
}