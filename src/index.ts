/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface BlogPost {
	id: number;
	title: string;
	content: string;
	created_at: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Initialize database
		await env.DB.prepare(
			'CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
		).run();

		switch (url.pathname) {
			case '/':
				// Serve the main HTML page
				const html = `
					<!DOCTYPE html>
					<html>
					<head>
						<title>Instagram Style Blog</title>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<script src="https://cdn.tailwindcss.com"></script>
						<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
					</head>
					<body class="bg-gray-50">
						<!-- Instagram-style header -->
						<header class="bg-white border-b border-gray-300 sticky top-0 z-10">
							<div class="container mx-auto px-4 py-3 flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<i class="fab fa-instagram text-2xl"></i>
									<span class="font-bold text-xl">Instagram Blog</span>
								</div>
								<div class="flex-1 mx-10">
									<div class="relative">
										<input type="text" placeholder="Search" class="w-full bg-gray-100 rounded-md py-1 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500">
										<i class="fas fa-search absolute left-3 top-2 text-gray-400"></i>
									</div>
								</div>
								<div class="flex items-center space-x-4">
									<i class="fas fa-home text-xl cursor-pointer"></i>
									<i class="far fa-plus-square text-xl cursor-pointer"></i>
									<i class="far fa-heart text-xl cursor-pointer"></i>
									<div class="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 cursor-pointer"></div>
								</div>
							</div>
						</header>

						<div class="container mx-auto px-4 py-6 max-w-2xl">
							<!-- Posts list (displayed at the top) -->
							<div id="postsContainer" class="space-y-6">
								<!-- Posts will be loaded here -->
							</div>

							<!-- Add new post form -->
							<div class="bg-white rounded-lg shadow-md p-6 mt-8 sticky bottom-4 border border-gray-300">
								<h2 class="text-xl font-semibold mb-4 flex items-center">
									<i class="fas fa-edit mr-2 text-blue-500"></i> Create New Post
								</h2>
								<form id="postForm" class="space-y-4">
									<div>
										<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
										<input type="text" id="title" name="title" required class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 border">
									</div>
									<div>
										<label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
										<textarea id="content" name="content" rows="3" required class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 border"></textarea>
									</div>
									<div class="flex justify-end">
										<button type="submit" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
											<i class="fas fa-paper-plane mr-2"></i> Share
										</button>
									</div>
								</form>
							</div>
						</div>

						<script>
							// Fetch and display posts
							async function fetchPosts() {
								try {
									const response = await fetch('/api/posts');
									const posts = await response.json();
									const container = document.getElementById('postsContainer');
									
									container.innerHTML = posts.map(post => 
										'<div class="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">' +
										'<div class="p-4 border-b border-gray-200">' +
											'<div class="flex items-center space-x-3">' +
												'<div class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500"></div>' +
												'<div>' +
													'<div class="font-semibold">User</div>' +
													'<div class="text-xs text-gray-500">' + new Date(post.created_at).toLocaleString() + '</div>' +
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="p-4">' +
											'<h3 class="text-lg font-bold mb-2">' + post.title + '</h3>' +
											'<p class="text-gray-700 mb-3">' + post.content + '</p>' +
											'<div class="flex items-center justify-between text-gray-500">' +
												'<div class="flex space-x-4">' +
													'<button class="flex items-center space-x-1 hover:text-red-500">' +
														'<i class="far fa-heart"></i>' +
														'<span>Like</span>' +
													'</button>' +
													'<button class="flex items-center space-x-1 hover:text-blue-500">' +
														'<i class="far fa-comment"></i>' +
														'<span>Comment</span>' +
													'</button>' +
													'<button class="flex items-center space-x-1 hover:text-green-500">' +
														'<i class="far fa-share-square"></i>' +
														'<span>Share</span>' +
													'</button>' +
												'</div>' +
												'<button onclick="deletePost(' + post.id + ')" class="text-red-500 hover:text-red-700">' +
													'<i class="fas fa-trash-alt"></i>' +
												'</button>' +
											'</div>' +
										'</div>' +
									'</div>'
									).join('');
								} catch (error) {
									console.error('Error fetching posts:', error);
								}
							}
							
							// Add new post
							document.getElementById('postForm').addEventListener('submit', async (e) => {
								e.preventDefault();
								const formData = new FormData(e.target);
								const postData = {
									title: formData.get('title'),
									content: formData.get('content')
								};
								
								try {
									const response = await fetch('/api/posts', {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
										},
										body: JSON.stringify(postData)
									});
									
									if (response.ok) {
										e.target.reset();
										fetchPosts(); // Refresh the posts list
									} else {
										console.error('Failed to add post');
									}
								} catch (error) {
									console.error('Error adding post:', error);
								}
							});
							
							// Delete post
							async function deletePost(id) {
								if (confirm('Are you sure you want to delete this post?')) {
									try {
										const response = await fetch('/api/posts/' + id, {
											method: 'DELETE'
										});
										
										if (response.ok) {
											fetchPosts(); // Refresh the posts list
										} else {
											console.error('Failed to delete post');
										}
									} catch (error) {
										console.error('Error deleting post:', error);
									}
								}
							}
							
							// Initial load
							fetchPosts();
						</script>
					</body>
					</html>
				`;

					return new Response(html, {
						headers: { 'Content-Type': 'text/html' },
					});
				case '/api/posts':
					if (request.method === 'GET') {
						// Get all posts
						const { results } = await env.DB.prepare('SELECT * FROM posts ORDER BY created_at DESC').all<BlogPost>();
						return new Response(JSON.stringify(results), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' },
						});
					} else if (request.method === 'POST') {
						// Add new post
						const { title, content } = await request.json<BlogPost>();
						const result = await env.DB.prepare(
							'INSERT INTO posts (title, content) VALUES (?, ?)'
						)
							.bind(title, content)
							.run();
						
						return new Response(JSON.stringify({ id: result.meta.last_row_id }), {
							headers: { ...corsHeaders, 'Content-Type': 'application/json' },
							status: 201,
						});
					} else {
						return new Response('Method Not Allowed', { status: 405 });
					}
					break;
				case '/api/posts/':
					// Handle paths like /api/posts/123
					if (request.method === 'DELETE') {
						const id = url.pathname.split('/').pop();
						if (id) {
							await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
							return new Response(null, {
								headers: corsHeaders,
								status: 204,
							});
						} else {
							return new Response('Bad Request', { status: 400 });
						}
					} else {
						return new Response('Method Not Allowed', { status: 405 });
					}
					break;
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
