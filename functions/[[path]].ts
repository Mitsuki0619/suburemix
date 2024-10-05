import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'

import { getLoadContext } from 'load-context'

import * as build from '../build/server'
export const onRequest = createPagesFunctionHandler({ build, getLoadContext })
