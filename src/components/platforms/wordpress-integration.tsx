import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function WordPressIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">WordPress Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite™ SMS alerts to your WordPress website
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
            WordPress, being a flexible and widely used content management system, provides several straightforward ways to embed code and widgets. The best method depends on where you want to place the code and which version of the WordPress editor you are using.
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
              <CardTitle className="text-2xl">Using the Custom HTML Block (Gutenberg Editor)</CardTitle>
              <CardDescription className="text-base">
                The easiest and most common way to embed code within a page or post
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for pages/posts</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              The modern WordPress editor, known as Gutenberg, uses a block-based system. This is the easiest and most common way to embed code within a page or post.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Add a Block:</strong> In the WordPress editor, click the <strong>(+)</strong> icon to add a new block.</li>
              <li><strong>Search for Custom HTML:</strong> Search for <strong>"Custom HTML"</strong> and select the block.</li>
              <li><strong>Paste Your Code:</strong> Paste your HTML, JavaScript, or widget code directly into the block.</li>
              <li><strong>Preview:</strong> You can click the <strong>"Preview"</strong> tab within the block to see how the code will render on your page. This is a great way to ensure the widget is working correctly before you publish.</li>
            </ol>
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
              <CardTitle className="text-2xl">Using Widgets in a Widget Area</CardTitle>
              <CardDescription className="text-base">
                For adding code to sidebar, footer, or other widget areas
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For widget areas</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              WordPress themes have designated "widget areas" like the sidebar or footer. You can use a widget to add code to these areas.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Access Widgets:</strong> From your WordPress dashboard, go to <strong>Appearance → Widgets</strong>.</li>
              <li><strong>Add a Custom HTML Widget:</strong> On the widgets page, find the <strong>"Custom HTML"</strong> widget and drag it to the desired widget area (e.g., "Sidebar," "Footer 1," etc.).</li>
              <li><strong>Paste and Save:</strong> Paste your code into the widget's content box and click <strong>"Save"</strong> or <strong>"Update."</strong> The widget will then appear on all pages where that widget area is displayed.</li>
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
              <CardTitle className="text-2xl">Using the Classic Editor</CardTitle>
              <CardDescription className="text-base">
                For the older WordPress editor (often enabled via plugin)
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For classic editor</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm font-medium">
              If you're using the older, "Classic" WordPress editor (often enabled via a plugin), the process is slightly different.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Switch to Text Mode:</strong> In the post or page editor, find the two tabs above the content box: "Visual" and "Text." Click on the <strong>Text</strong> tab. This will switch the editor to an HTML view.</li>
              <li><strong>Paste Your Code:</strong> Paste your embed code directly into the text view where you want the widget to appear.</li>
              <li><strong>Save/Publish:</strong> Save or publish the page.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Method 4 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <CardTitle className="text-2xl">Using Plugins</CardTitle>
              <CardDescription className="text-base">
                For advanced needs and site-wide code insertion
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For advanced users</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-sm font-medium">
              For more advanced needs, or for code that needs to be inserted into the &lt;head&gt; or &lt;body&gt; of your site, a dedicated plugin is the safest and most reliable method. This is essential for things like Google Analytics tracking code or Facebook Pixels.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">WPCode:</h4>
              <p className="text-sm text-muted-foreground">
                This is a highly-rated plugin that allows you to manage code snippets for your site. You can create a new snippet, paste your code, and choose where to insert it (e.g., site-wide header, before a post, etc.). This prevents you from having to edit theme files directly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Insert Headers and Footers:</h4>
              <p className="text-sm text-muted-foreground">
                This is a simpler plugin that provides a clean interface for pasting code into the header or footer of your site, which is perfect for analytics and tracking codes.
              </p>
            </div>
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
            Watch step-by-step video guides for embedding code in WordPress
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
                <h4 className="font-semibold text-lg mb-2">How To Embed Code In WordPress 2025 🔥 - (FAST & Easy!)</h4>
                <p className="text-muted-foreground mb-3">
                  Fast and easy guide for embedding code in WordPress
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From WP Cupid Blog - WordPress Tutorials • 1 minute 52 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=05gsNRMxeFQ" 
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
                <h4 className="font-semibold text-lg mb-2">How To Add HTML Code In WordPress (Quick & Simple)</h4>
                <p className="text-muted-foreground mb-3">
                  Quick and simple guide for adding HTML code
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  From KnowledgeBase • 1 minute 19 seconds
                </p>
                <Button asChild size="sm">
                  <a 
                    href="http://www.youtube.com/watch?v=dg5h1zo3XQU" 
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