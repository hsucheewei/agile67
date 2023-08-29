// document.addEventListener('DOMContentLoaded', () => {
//     const commentForm = document.getElementById('commentForm');
//     const commentsContainer = document.querySelector('.comments');
  
//     commentForm.addEventListener('submit', (event) => {
//       event.preventDefault();
  
//       const formData = new FormData(commentForm);
  
//       fetch(commentForm.getAttribute('action'), {
//         method: 'POST',
//         body: formData,
//       })
//         .then((response) => response.json())
//         .then((newComment) => {
//           const commentDiv = document.createElement('div');
//           commentDiv.className = 'bg-light block p-4 mb-4 mt-2';
  
//           newComment.comment_content.split('\n').forEach((line) => {
//             const paragraph = document.createElement('p');
//             paragraph.className = 'mb-6';
//             paragraph.textContent = line;
//             commentDiv.appendChild(paragraph);
//           });
  
//           const postedTimestamp = document.createElement('span');
//           postedTimestamp.innerHTML = `<sub><b>Posted: </b><date>${newComment.posted_timestamp}</date></sub>`;
//           commentDiv.appendChild(postedTimestamp);
  
//           const authorInfo = document.createElement('span');
//           authorInfo.innerHTML = `<sub><b>By: </b><date>${newComment.firstName} ${newComment.lastName}</date></sub>`;
//           commentDiv.appendChild(authorInfo);
  
//           commentsContainer.appendChild(commentDiv);
  
//           // Clear the comment textarea
//           document.getElementById('comment').value = '';
//         })
//         .catch((error) => {
//           console.error('Error adding comment:', error);
//         });
//     });
//   });