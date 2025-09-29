import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function BigCommerceIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
        
          <div>
            <h1 className="text-4xl font-bold mt-4">BigCommerce Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite™ SMS alerts to your BigCommerce store
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Clock className="w-3 h-3 mr-1" />
          Setup time: 5-10 minutes
        </Badge>
      </div>

      {/* Introduction */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Embedding code on BigCommerce websites is a common task, especially for adding third-party widgets like review displays, trust badges, or tracking scripts. BigCommerce provides a few ways to do this, ranging from a user-friendly drag-and-drop method to more advanced theme file editing.
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
              <CardTitle className="text-2xl">Using the Page Builder (HTML Widget)</CardTitle>
              <CardDescription className="text-base">
                The simplest way to add a widget to a specific page or section of your site
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for most users</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              This method is perfect for adding Text2MySite™ to specific pages like product pages, landing pages, or your homepage.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>From your BigCommerce Admin, go to <strong>Storefront → Themes</strong>.</li>
              <li>On your current theme, click the <strong>Customize</strong> button to open the Page Builder.</li>
              <li>Navigate to the page where you want to add the widget (e.g., a specific product page, a landing page, or your homepage).</li>
              <li>In the left-hand sidebar, click on the <strong>HTML Widget</strong> and drag it to the desired location on your page.</li>
              <li>Click on the widget in the preview, and a text box will appear in the sidebar. Paste your embed code (HTML, CSS, or JavaScript) into this box.</li>
              <li>Click <strong>Save</strong> and then <strong>Publish</strong> to make the changes live on your store.</li>
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
              <CardTitle className="text-2xl">Using the Script Manager (for Sitewide Scripts)</CardTitle>
              <CardDescription className="text-base">
                Perfect for adding scripts that need to load on every page of your store
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Best for sitewide widgets</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              This method is perfect for adding scripts that need to load on every page of your store, such as a Google Analytics tracking code or a Facebook Pixel.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li>From your BigCommerce Admin, go to <strong>Storefront → Script Manager</strong>.</li>
              <li>Click the <strong>Create a Script</strong> button.</li>
              <li>Give your script a name (e.g., "Google Analytics") and a description.</li>
              <li>Choose the script location (Head, Body, or Footer). For most tracking scripts, Head is the recommended location. For sitewide widgets like a chatbox, Footer is often the best choice.</li>
              <li>Choose the pages where the script will be active (e.g., All Pages, Specific Pages).</li>
              <li>Paste your script code into the "Script contents" box.</li>
              <li>Click <strong>Save</strong>. The script will now be active on your live storefront.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Method 3 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <CardTitle className="text-2xl">Editing Theme Files (Advanced)</CardTitle>
              <CardDescription className="text-base">
                Most flexible method for custom placement and advanced users
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Advanced users only</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm font-medium">
              This is the most flexible method and is required for more complex widgets that need to be in a very specific spot on a template that doesn't use the Page Builder.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Back Up Your Theme:</strong> This is a critical first step. From the Themes section in your Admin, click on Advanced on your current theme and then select Make a Copy.</li>
              <li><strong>Access the Code Editor:</strong> On the duplicated theme, click the three dots and select Edit Theme Files.</li>
              <li><strong>Find the Correct File:</strong> The files you need to edit will depend on the widget.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  <li>For a product page, you might edit a file in the templates/pages/products folder.</li>
                  <li>For a sitewide footer widget, you'd likely add code to the templates/layout/base.html or a similar file.</li>
                </ul>
              </li>
              <li><strong>Paste and Save:</strong> Paste your code in the appropriate location within the file. You will need to have a basic understanding of HTML and the BigCommerce Stencil framework to do this correctly.</li>
              <li>Once you're finished, click <strong>Save file</strong>. You can preview your changes on the duplicated theme. Once you're sure it works, you can <strong>Apply</strong> the theme to your storefront.</li>
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
            Watch step-by-step video guides for adding code to BigCommerce
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
                <h4 className="font-semibold text-lg mb-2">BigCommerce Embed Code Screen Cast</h4>
                <p className="text-muted-foreground mb-3">
                  Screen cast demonstration of embedding code in BigCommerce
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the channel Orderv • 2 minutes 59 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=bYiBxbQIhXY" 
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
                <h4 className="font-semibold text-lg mb-2">How to Add PDF Embed to BigCommerce</h4>
                <p className="text-muted-foreground mb-3">
                  Guide for adding PDF embeds and custom content to BigCommerce
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From the channel Elfsight • 3 minutes 10 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=f2M0rR1GcgQ" 
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
