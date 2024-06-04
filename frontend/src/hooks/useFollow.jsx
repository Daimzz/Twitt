import {useMutation, useQueryClient} from "@tanstack/react-query";


const useFollow = () => {
	const queryClient = useQueryClient()
	const {mutate: followUser, isPending} = useMutation({
			mutationFn: async (userId) => {
				try {
					const res = await fetch(`/api/users/follow/${userId}`, {
						method: 'POST'
					})
					const data = await res.json()
					if (!res.ok) {
						throw new Error(data.error)
					}
					return data
				} catch (err) {
					throw new Error(err.message)
				}
			},
			onSuccess: () => {
				Promise.all([
					queryClient.invalidateQueries({queryKey: ['suggestedUsers']}),
					queryClient.invalidateQueries({queryKey: ['authUser']})
				])
			},
			onError: (error) => {
				console.log(error)
			},

		}
	)
	return {followUser, isPending}
}
export default useFollow