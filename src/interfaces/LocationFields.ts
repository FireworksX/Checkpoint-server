import { Schema } from 'mongoose';

export type LocationTitleField = string

export type LocationDescriptionField = string

export type LocationGalleryField = Schema.Types.ObjectId[]

export type LocationKitchenField = string[]

export type LocationWifispeedField = number

export type LocationAverageBillField = [number, number]

export type LocationTagsField = string[]

