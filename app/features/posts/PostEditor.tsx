import {
  FieldMetadata,
  FormMetadata,
  getFormProps,
  getInputProps,
  useInputControl,
} from '@conform-to/react'
import { Form, useNavigation } from '@remix-run/react'
import {
  Bold,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Save,
  X,
} from 'lucide-react'
import { Fragment, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'

import styles from './markdown.module.css'

interface Props {
  type: 'create' | 'edit'
  form: FormMetadata<{
    title: string
    content: string
    categories: string[]
    published?: boolean
  }>
  title: FieldMetadata<string>
  content: FieldMetadata<string>
  categories: FieldMetadata<string[]>
  categoriesOptions: { value: string; label: string }[]
  published: FieldMetadata<boolean>
}

export const PostEditor = ({
  type,
  title,
  form,
  categories,
  content,
  categoriesOptions,
  published,
}: Props) => {
  const [interactiveInputValues, setInteractiveInputValues] = useState<{
    title: string | undefined
    content: string | undefined
    categories: string | (string | undefined)[]
  }>({
    title: title.value,
    content: content.value,
    categories: categories.value ?? [],
  })

  const navigation = useNavigation()
  const contentInputRef = useRef<HTMLTextAreaElement>(null)
  const categoriesInputControl = useInputControl(categories)
  const insertMarkdown = (prefix: string = '', suffix: string = '') => {
    const textarea = contentInputRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = (interactiveInputValues.content ?? '')
      .toString()
      .substring(start, end)
    const replacement = `${prefix}${selectedText}${suffix}`
    setInteractiveInputValues((prev) => ({
      ...prev,
      content: `${(prev.content ?? '').slice(
        0,
        start
      )}${replacement}${(prev.content ?? '').slice(end)}`,
    }))
    console.log(interactiveInputValues.content)
  }
  const handleCheckCategory = (category: string) => {
    if (!Array.isArray(interactiveInputValues.categories)) return
    const newValue = (
      interactiveInputValues.categories.includes(category)
        ? interactiveInputValues.categories.filter((c) => c !== category)
        : [...interactiveInputValues.categories, category]
    ).filter((c) => c != null)
    setInteractiveInputValues((prev) => ({
      ...prev,
      categories: newValue,
    }))
    categoriesInputControl.change(newValue)
  }

  const formProps = getFormProps(form)
  const titleProps = getInputProps(title, { type: 'text' })
  const contentProps = getInputProps(content, { type: 'text' })

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Form {...formProps} method="post">
        <h1 className="text-xl font-bold mb-8">{type.toUpperCase()} Post</h1>
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title" className="text-lg">
                  Title
                </Label>
                <Input
                  placeholder="Enter your post title"
                  {...titleProps}
                  key={titleProps.key}
                  onChange={(e) =>
                    setInteractiveInputValues((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-2 text-lg"
                />
                {title.errors?.map((error, index) => (
                  <p className="mt-1 text-sm text-red-600" key={index}>
                    {error}
                  </p>
                ))}
              </div>
              <div>
                <Label className="text-lg mb-2 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categoriesOptions.map((category) => (
                    <Fragment key={category.value.toString()}>
                      <label>
                        <Badge
                          key={category.value.toString()}
                          variant={
                            interactiveInputValues.categories.includes(
                              category.value
                            )
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer text-sm py-1 px-2"
                          defaultChecked={interactiveInputValues.categories.includes(
                            category.value
                          )}
                          onClick={() => handleCheckCategory(category.value)}
                        >
                          {category.label}
                          {interactiveInputValues.categories.includes(
                            category.value
                          ) && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      </label>
                      {categories.errors?.map((error, index) => (
                        <p className="mt-1 text-sm text-red-600" key={index}>
                          {error}
                        </p>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="publishStatus" className="text-lg">
                    Publish
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      defaultChecked={published.initialValue === 'on'}
                      name="published"
                    />
                  </div>
                </div>
                {published.errors?.map((error, index) => (
                  <p className="mt-1 text-sm text-red-600" key={index}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor" className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <div className="space-y-4 flex-grow flex flex-col">
                  <div className="flex space-x-2 mb-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertMarkdown('**', '**')}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertMarkdown('*', '*')}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertMarkdown('[', '](url)')}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertMarkdown('![alt text](', ')')}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertMarkdown('- ')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => insertMarkdown('1. ')}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Write your post content here (using Markdown)"
                    className="h-[800px] text-lg font-mono resize-none"
                    ref={contentInputRef}
                    {...contentProps}
                    defaultValue={undefined}
                    value={interactiveInputValues.content}
                    key={contentProps.key}
                    onChange={(e) =>
                      setInteractiveInputValues((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                  />
                  {content.errors?.map((error, index) => (
                    <p className="mt-1 text-sm text-red-600" key={index}>
                      {error}
                    </p>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    className="text-lg"
                    disabled={navigation.state === 'submitting'}
                  >
                    <Save className="mr-2 h-5 w-5" /> Save Post
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="preview">
                <h1>{title.value}</h1>
                <div className="prose max-w-none dark:prose-invert">
                  <ReactMarkdown className={styles.md}>
                    {interactiveInputValues.content}
                  </ReactMarkdown>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Form>
    </div>
  )
}
