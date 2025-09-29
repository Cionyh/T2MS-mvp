import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock } from "lucide-react";

export function ShopifyIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">Shopify Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite™ SMS alerts to your Shopify store
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
            Embedding code on a Shopify store is a common practice, and Shopify provides excellent tools for it, particularly in its new "Online Store 2.0" themes. There are two primary methods for adding code to a Shopify site.
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
              <CardTitle className="text-2xl">Using the "Custom Liquid" Section</CardTitle>
              <CardDescription className="text-base">
                Ideal for adding a widget to a specific page or section
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended for specific pages</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium">
              This method is ideal for adding a widget or code snippet to a specific page or section (e.g., a product page, blog post, or the home page). This is the safest way to add on-page widgets as it doesn't require direct editing of your core theme files.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Access the Theme Customizer:</strong> From your Shopify Admin, go to <strong>Online Store → Themes</strong>. On your current theme, click the <strong>Customize</strong> button.</li>
              <li><strong>Add a Section:</strong> Navigate to the page where you want to add the widget. On the left-hand sidebar, click <strong>Add section</strong>.</li>
              <li><strong>Find "Custom Liquid":</strong> Scroll down the list of sections and select <strong>Custom Liquid</strong>.</li>
              <li><strong>Paste Your Code:</strong> Click on the new "Custom Liquid" section in the sidebar. A code box will appear on the right. Paste your widget's HTML, CSS, or JavaScript code into this box.</li>
              <li><strong>Save:</strong> Click the <strong>Save</strong> button in the top right corner. The widget should now appear on your page.</li>
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
              <CardTitle className="text-2xl">Editing Theme Code (For Site-Wide Scripts)</CardTitle>
              <CardDescription className="text-base">
                For adding scripts that need to load on every page of your store
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">For sitewide scripts</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              This method is for adding scripts that need to load on every page of your store, such as a tracking pixel, a live chat widget, or a sitewide pop-up.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Duplicate Your Theme:</strong> Before you begin, always create a backup of your theme. From your Shopify Admin, go to <strong>Online Store → Themes</strong>. Click <strong>Actions → Duplicate</strong> on your current theme. This is a crucial step to prevent any permanent damage to your live store.</li>
              <li><strong>Access the Code Editor:</strong> On the duplicated theme, click <strong>Actions → Edit code</strong>.</li>
              <li><strong>Find theme.liquid:</strong> In the left-hand file tree, navigate to the <strong>Layout</strong> folder and select <strong>theme.liquid</strong>. This file is the core template for your store, and code placed here will appear on every page.</li>
              <li><strong>Paste Your Code:</strong>
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  <li><strong>Header Code:</strong> For tracking scripts or meta tags, paste the code just before the closing <code>&lt;/head&gt;</code> tag.</li>
                  <li><strong>Footer Code:</strong> For chat widgets or other scripts that don't need to load immediately, paste the code just before the closing <code>&lt;/body&gt;</code> tag.</li>
                </ul>
              </li>
              <li><strong>Save:</strong> Click the <strong>Save</strong> button in the top right. Test the widget on your live site. Once you're sure it's working correctly, you can publish the duplicated theme to make it live for all customers.</li>
            </ol>
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
            Watch a step-by-step video guide for adding HTML code to Shopify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="font-semibold text-lg mb-2">How to Add HTML Code to Shopify (2025) Step by Step Tutorial</h4>
            <p className="text-muted-foreground mb-2">
              Visual guide covering HTML code integration in Shopify stores
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              From the channel Tech Express • 3 minutes 37 seconds
            </p>
            <Button asChild>
              <a 
                href="https://www.youtube.com/watch?v=7T9zulbmIAc" 
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