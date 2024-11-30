import { SerializeFrom } from '@remix-run/cloudflare'
import {
  Save,
  Image,
  Link,
  Bold,
  Italic,
  List,
  ListOrdered,
  Badge,
} from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input, InputProps } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea, TextareaProps } from '~/components/ui/textarea'

import { SelectProps } from '../../../node_modules/.pnpm/@radix-ui+react-select@2.1.2_@types+react-dom@18.3.0_@types+react@18.3.11_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-select/dist/index.d'

interface Props {
  editorProps: TextareaProps
  titleInputProps: InputProps
  categoriesSelectionProps: {
    value: string[]
    on
  }
  categoriesOptions: SerializeFrom<{ label: string; value: string }[]>
}

export const BlogEditor = ({
  titleInputProps,
  categoriesSelectionProps,
  editorProps,
  categoriesOptions,
}: Props) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')

  const handleSave = () => {
    // Implement save functionality here
    console.log('Saving blog post:', { title, content, category })
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${prefix}${selectedText}${suffix}`
    setContent(
      content.substring(0, start) + replacement + content.substring(end)
    )
  }

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Create/Edit Blog Post</h1>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-lg">
                Title
              </Label>
              <Input
                placeholder="Enter your blog title"
                className="mt-2 text-lg"
                {...titleInputProps}
              />
            </div>
            <div>
              <Label className="text-lg mb-2 block">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categoriesOptions.map((category) => (
                  <Badge
                    key={category.value}
                    variant={
                      categories.includes(category) ? 'default' : 'outline'
                    }
                    className="cursor-pointer text-sm py-1 px-2"
                    onClick={() => toggleCategory(category)}
                  >
                    {category.label}
                    {categories.includes(category) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:h-[800px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="space-y-4 flex-grow flex flex-col">
              <div className="flex space-x-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertMarkdown('**', '**')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertMarkdown('*', '*')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertMarkdown('[', '](url)')}
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertMarkdown('![alt text](', ')')}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertMarkdown('- ')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => insertMarkdown('1. ')}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Write your blog content here (using Markdown)"
                className="flex-grow text-lg font-mono resize-none"
                {...editorProps}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:h-[800px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="flex-grow overflow-auto">
                <div className="prose max-w-none dark:prose-invert">
                  <h1>{title}</h1>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </TabsContent>
              <TabsContent value="raw" className="flex-grow overflow-auto">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md h-full">
                  {content}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} size="lg" className="text-lg">
          <Save className="mr-2 h-5 w-5" /> Save Post
        </Button>
      </div>
    </div>
  )
}
