import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Clock, AlertCircle } from "lucide-react";

export function JoomlaIntegration() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          
          <div>
            <h1 className="text-4xl font-bold mt-4">Joomla Integration</h1>
            <p className="text-muted-foreground text-lg">
              Add Text2MySite SMS alerts to your Joomla website
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
            Due to Joomla's default security settings, which often remove certain HTML tags like <code>&lt;iframe&gt;</code> and <code>&lt;script&gt;</code>, you need to take specific steps to embed code or widgets. The two most common methods are using a Custom HTML Module or a third-party extension.
          </p>
        </CardContent>
      </Card>

      {/* Method 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <CardTitle className="text-2xl">Using the Custom HTML Module</CardTitle>
              <CardDescription className="text-base">
                Ideal for embedding code in a specific module position on a page
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Built-in method</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">
              This method is ideal for embedding code in a specific module position on a page, like a sidebar, footer, or header.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Step-by-Step Instructions:</h4>
            <ol className="space-y-3 list-decimal list-inside">
              <li><strong>Access Module Manager:</strong> From your Joomla administrator dashboard, go to <strong>Extensions → Modules</strong>.</li>
              <li><strong>Create a New Module:</strong> Click the <strong>"New"</strong> button in the top left corner, then select <strong>Custom</strong> from the list of module types.</li>
              <li><strong>Configure the Module:</strong>
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  <li>Give your module a <strong>Title</strong>.</li>
                  <li>Choose a <strong>Module Position</strong> from the dropdown list. This is where the widget will appear on your site.</li>
                  <li>In the content area, you will need to paste your code. This is where you might encounter the editor stripping out your code.</li>
                </ul>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Dealing with Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Dealing with the Editor
          </CardTitle>
          <CardDescription>
            Joomla's default editor often removes embed code - here's how to handle it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm font-medium">
              Joomla's default editor, TinyMCE, often removes embed code. You have a few options to bypass this:
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Change Editor Settings:</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You can configure TinyMCE to allow certain tags. Go to <strong>System → Plugins</strong>, find the "Editor - TinyMCE" plugin, and adjust its settings to allow tags like <code>&lt;iframe&gt;</code> or <code>&lt;script&gt;</code>. You might need to add these tags to the "Extended Valid Elements" field.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Disable the Editor:</h4>
              <p className="text-sm text-muted-foreground mt-1">
                A quick workaround is to temporarily disable your editor. Go to <strong>System → Global Configuration</strong>, and under "Default Editor," select <strong>"Editor - None."</strong> This will give you a plain text box where you can safely paste your code without it being stripped. Remember to switch your editor back once you're done.
              </p>
            </div>
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
              <CardTitle className="text-2xl">Using a Third-Party Extension</CardTitle>
              <CardDescription className="text-base">
                Often the most user-friendly and reliable way to embed code
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Recommended method</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">
              This is often the most user-friendly and reliable way to embed code. The Joomla Extensions Directory offers a variety of plugins specifically designed for this purpose.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Sourcerer:</h4>
              <p className="text-sm text-muted-foreground">
                This is a very popular and highly-rated plugin that allows you to embed PHP, HTML, CSS, and JavaScript directly into your articles and modules using special tags. For example, you would place your code between <code>{'{source}'}</code> and <code>{'{/source}'}</code> tags.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">JCE Editor:</h4>
              <p className="text-sm text-muted-foreground">
                The Joomla Content Editor (JCE) is a powerful, free editor that offers more control and features than the default TinyMCE. The Pro version has an "Easy Embed" feature that lets you simply paste a URL from a supported service (like YouTube or Google Maps), and it handles the embedding for you.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>To use an extension:</strong> Download the .zip file from the Joomla Extensions Directory and install it via the <strong>Extensions → Manage → Install</strong> menu in your dashboard.
              </p>
            </div>
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
            Watch a step-by-step video guide for embedding content in Joomla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Embed YouTube videos in Joomla 3 with JCE</h4>
            <p className="text-muted-foreground mb-2">
              Step-by-step guide on how to embed content in Joomla using the JCE editor
            </p>
            <Button asChild>
              <a 
                href="https://youtu.be/Nm33KuHVQD8?si=6Taj8Z_BEhq_kmLG" 
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
