import {
  getFormProps,
  getInputProps,
  useForm,
  useInputControl,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
} from '@remix-run/react'
import { Camera, Save } from 'lucide-react'
import { useRef, useState } from 'react'
import { jsonWithError, jsonWithSuccess, redirectWithError } from 'remix-toast'
import { z } from 'zod'
import { zx } from 'zodix'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { UserForClient } from '~/routes/_auth+/_layout'
import { getAuthenticator } from '~/services/auth/auth.server'
import { getPrivateProfile } from '~/services/profile/getPrivateProfile.server'
import { updateProfile } from '~/services/profile/updateProfile.server'
import { uploadProfileImage } from '~/services/profile/uploadProfileImage.server'

const IMAGE_TYPES = ['image/jpg', 'image/png']
const MAX_IMAGE_SIZE = 5 // 5MB
// バイト単位のサイズをメガバイト単位に変換する
const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024)
  return +result.toFixed(decimalsNum)
}

export const schemaForUpdateProfile = z.object({
  newImageFile: z
    .string()
    .transform((b64) => {
      // ファイルの拡張子(png)
      const fileExtension = b64
        .toString()
        .slice(b64.indexOf('/') + 1, b64.indexOf(';'))

      // ContentType(image/png)
      const contentType = b64
        .toString()
        .slice(b64.indexOf(':') + 1, b64.indexOf(';'))

      const bin = atob(b64?.replace(/^.*,/, ''))
      // Convert to binary data
      const buffer = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i)
      }
      const file = new File([buffer.buffer], `profileImage.${fileExtension}`, {
        type: contentType,
      })
      return file
    })
    .refine((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE, {
      message: 'File size must be at most 5MB',
    })
    .refine((file) => IMAGE_TYPES.includes(file.type), {
      message: 'Only .jpg or .png files are allowed.',
    })
    .optional(),
  imageUrl: z.string().url().optional(),
  name: z
    .string({ required_error: 'Name is required' })
    .max(255, 'Name must be less than 255 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
})

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const { authenticator, sessionStorage } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const formData = await request.clone().formData()
  const submission = parseWithZod(formData, { schema: schemaForUpdateProfile })
  if (!user) {
    return jsonWithError(
      {
        result: submission.reply(),
      },
      {
        message: 'Unauthorized',
        description: 'You must be logged in to update your profile',
      }
    )
  }
  if (user.id !== params.userId) {
    return jsonWithError(
      {
        result: submission.reply(),
      },
      {
        message: 'Unauthorized',
        description: 'You are not authorized to update this profile',
      }
    )
  }
  if (submission.status !== 'success') {
    return json({ result: submission.reply() })
  }
  const { newImageFile, imageUrl, name, email, bio } = submission.value

  /**
   * 新しい画像がアップロードされた場合、SupabaseにアップロードしてURLを取得する
   */
  const newImageUrl = await (async () => {
    if (!newImageFile) return null

    const profileImageUrl = await uploadProfileImage({
      context,
      request,
      userId: user.id,
      imageFile: newImageFile,
    })

    return profileImageUrl
  })()

  const { bio: _, ...newUserData } = await updateProfile(context, {
    userId: params.userId,
    image: newImageUrl ?? imageUrl,
    name,
    email,
    bio,
  })

  // プロフィール更新後にセッションも更新しヘッダーの情報を最新化する
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  session.set(authenticator.sessionKey, { ...user, ...newUserData })
  const cookie = await sessionStorage.commitSession(session)

  return jsonWithSuccess(
    { result: submission.reply() },
    {
      message: 'Profile updated successfully',
      description: 'Your profile has been updated successfully',
    },
    { headers: { 'Set-Cookie': cookie } }
  )
}

export const loader = async ({
  context,
  params,
  request,
}: LoaderFunctionArgs) => {
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  if (!user || user.id !== params.userId) {
    return redirectWithError(`/${params.userId}/profile`, {
      message: 'Unauthorized',
      description: 'You are not authorized to update this profile',
    })
  }
  const { userId } = zx.parseParams(params, {
    userId: z.string(),
  })
  const profile = await getPrivateProfile(context, userId)
  return json({ profile })
}

export default function Index() {
  const user = useOutletContext<UserForClient>()
  const { profile } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const [form, { name, email, imageUrl, newImageFile, bio }] = useForm({
    lastResult: actionData?.result,
    defaultValue: {
      name: profile?.name,
      email: profile?.email,
      bio: profile?.bio,
      imageUrl: profile?.image,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaForUpdateProfile })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  const imageInputControl = useInputControl(newImageFile)

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(
    profile?.image
  )

  if (!profile) return null
  return (
    <div className="mx-auto px-4 pt-4 pb-8">
      <Card className="max-w-2xl mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" {...getFormProps(form)} action="#">
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32">
                  {previewImageUrl != null ? (
                    <AvatarImage
                      src={previewImageUrl}
                      alt="プロフィールアイコン"
                    />
                  ) : (
                    <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change profile picture</span>
                </Button>
                <Input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={profileImageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = (e) => {
                      if (typeof e.target?.result !== 'string') return
                      imageInputControl.change(e.target.result)

                      setPreviewImageUrl(e.target.result)
                    }
                  }}
                />
                <Input {...getInputProps(imageUrl, { type: 'hidden' })} />
                {newImageFile.errors?.map((error, index) => (
                  <p className="text-sm text-destructive mt-1" key={index}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input {...getInputProps(name, { type: 'text' })} />
                {name.errors?.map((error, index) => (
                  <p className="text-sm text-destructive mt-1" key={index}>
                    {error}
                  </p>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input {...getInputProps(email, { type: 'email' })} />
                {email.errors?.map((error, index) => (
                  <p className="text-sm text-destructive mt-1" key={index}>
                    {error}
                  </p>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  className="min-h-[100px]"
                  {...getInputProps(bio, { type: 'text' })}
                />
                {bio.errors?.map((error, index) => (
                  <p className="text-sm text-destructive mt-1" key={index}>
                    {error}
                  </p>
                ))}
              </div>
              {user?.provider === 'Credentials' && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  type="button"
                >
                  <Link to={`/${profile.id}/password_change`}>
                    Change Password
                  </Link>
                </Button>
              )}
              <Button
                className="w-full"
                type="submit"
                disabled={navigation.state === 'submitting'}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
