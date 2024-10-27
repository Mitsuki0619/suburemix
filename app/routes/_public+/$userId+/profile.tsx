import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from '@remix-run/react'
import { Camera, Save } from 'lucide-react'
import { z } from 'zod'
import { zx } from 'zodix'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { getAuthenticator } from '~/services/auth/auth.server'
import { getProfile } from '~/services/profile/getProfile'
import { updateProfile } from '~/services/profile/updateProfile'

export const schemaForUpdateProfile = z.object({
  image: z.string().optional(),
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
  const authenticator = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const formData = await request.clone().formData()
  const submission = parseWithZod(formData, { schema: schemaForUpdateProfile })
  if (!user) {
    return json(
      submission.reply({
        fieldErrors: {
          userId: ['You must be signed in to update your profile'],
        },
      })
    )
  }
  if (user.id !== params.userId) {
    return json(
      submission.reply({
        fieldErrors: { userId: ['You can only update your own profile'] },
      })
    )
  }
  if (submission.status !== 'success') {
    return submission.reply()
  }
  await updateProfile(context, {
    userId: params.userId,
    image: String(formData.get('image')),
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    bio: String(formData.get('bio')),
  })
  return json(submission.reply())
}

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const { userId } = zx.parseParams(params, {
    userId: z.string(),
  })
  const profile = await getProfile(context, userId)
  return json(profile)
}

export default function Index() {
  const profile = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, { name, email, image, bio }] = useForm({
    lastResult,
    defaultValue: {
      name: profile?.name,
      email: profile?.email,
      bio: profile?.bio,
      image: profile?.image,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaForUpdateProfile })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  if (!profile) return null
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <Form method="post" {...getFormProps(form)}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
          <div className="relative inline-block">
            <Avatar className="w-32 h-32">
              {profile.image ? (
                <AvatarImage src={profile.image} alt={profile.name} />
              ) : (
                <AvatarFallback>
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <Button
              size="icon"
              className="absolute bottom-0 right-0 rounded-full"
              type="button"
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change profile picture</span>
            </Button>
            {image.errors?.map((error, index) => (
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
          <Button variant="outline" className="w-full" type="button">
            Change Password
          </Button>
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
    </div>
  )
}
