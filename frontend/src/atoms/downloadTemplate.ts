import { getOrElse } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { ffetch } from '../lib/httpClient'
import { CustomTemplate } from '../types'
import { serverSideCookiesState, serverURL } from './settings'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const cookiesTemplateState = atom<Promise<string>>(async (get) =>
  await get(serverSideCookiesState)
    ? '--cookies=cookies.txt'
    : ''
)

export const customArgsState = atomWithStorage(
  'customArgs',
  localStorage.getItem('customArgs') ?? ''
)

export const filenameTemplateState = atomWithStorage(
  'lastFilenameTemplate',
  localStorage.getItem('lastFilenameTemplate') ?? ''
)

export const downloadTemplateState = atom<Promise<string>>(async (get) =>
  `${get(customArgsState)} ${await get(cookiesTemplateState)}`
    .replace(/  +/g, ' ')
    .trim()
)

export const savedTemplatesState = atom<Promise<CustomTemplate[]>>(async (get) => {
  const task = ffetch<CustomTemplate[]>(`${get(serverURL)}/api/v1/template/all`)
  const either = await task()

  return pipe(
    either,
    getOrElse(() => new Array<CustomTemplate>())
  )
}
)