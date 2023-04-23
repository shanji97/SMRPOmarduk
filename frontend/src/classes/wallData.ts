export interface PostData {
  id?: string,
  userId?: string,
  projectId?: string,
  title: string,
  postContent: string,
  author: string,
  created?: string,
  comments?: Comment[]
}

export interface Comment {
  content: string,
  author: string
}