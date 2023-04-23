export interface PostData {
  id?: string,
  projectId: string,
  postContent: string,
  author: string,
  created: string,
  comments?: Comment[]
}

export interface Comment {
  content: string,
  author: string
}