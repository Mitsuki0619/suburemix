import { User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

import { getSupabaseServerClient } from '~/services/supabase/supabase.server'

export const uploadProfileImage = async ({
  context,
  request,
  userId,
  imageFile,
}: {
  context: AppLoadContext
  request: Request
  userId: User['id']
  imageFile: File
}) => {
  const supabase = getSupabaseServerClient(context, request)
  const contentType = imageFile.type
  const extension = contentType === 'image/png' ? 'png' : 'jpeg'
  const { data: uploadedData } = await supabase.storage
    .from(context.cloudflare.env.SUPABASE_STORAGE_BUCKET)
    .upload(`profile/${userId}.${extension}`, imageFile, {
      upsert: true,
      contentType,
    })
  if (!uploadedData) {
    throw new Error('Failed to upload profile image')
  }
  const { data } = supabase.storage
    .from(context.cloudflare.env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(uploadedData?.path)

  return data.publicUrl
}
