import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import {useQuery} from "@tanstack/react-query";

export const Posts = ({feedType, username, userId, setPostNumbers = null}) => {

	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "api/posts/all";
			case "following":
				return "api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "api/posts/all";
		}
	}


	const POSTS_ENDPOINT = getPostEndpoint()
	const {data: posts, isLoading} = useQuery({
		queryKey: ["posts", feedType, userId],
		queryFn: async () => {
			try {
				const res = await fetch(POSTS_ENDPOINT)
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || "Can't fetch posts")
				if(setPostNumbers) setPostNumbers(data.length)
				return data
			} catch (error) {
				throw new Error(error);
			}
		},
	})
	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton/>
					<PostSkeleton/>
					<PostSkeleton/>
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading
				&& posts
				&& posts.map((post) => (
					<div key={post._id}>
						<Post post={post}/>
					</div>
				))}


		< />
	);
};
