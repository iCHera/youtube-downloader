<script setup>
import { ref } from 'vue';

const youtubeURL = ref('');
const isLoading = ref(false);
const errorMessage = ref(''); 

async function downloadVideo() {
  errorMessage.value = '';

  if (!youtubeURL.value.trim()) {
    errorMessage.value = 'Пожалуйста, вставьте ссылку!';
    return;
  }

  if (!youtubeURL.value.includes('youtube.com') && !youtubeURL.value.includes('youtu.be')) {
    errorMessage.value = 'Пожалуйста, вставьте правильную ссылку на YouTube!';
    return;
  }

  isLoading.value = true;

  try {
    const apiURL = `http://localhost:4000/download?url=${encodeURIComponent(youtubeURL.value)}`;

    const response = await fetch(apiURL);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Сервер вернул ошибку');
    }

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    const contentDisposition = response.headers.get('content-disposition');
    let fileName = 'video.mp4';
    if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (fileNameMatch && fileNameMatch.length === 2)
            fileName = fileNameMatch[1];
    }
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    youtubeURL.value = ''; 

  } catch (error) {
    console.error('Ошибка при скачивании:', error);
    errorMessage.value = `Ошибка: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container">
    <header>
      <h1>YouTube Видео Загрузчик</h1>
      <p>Вставьте ссылку на видео с YouTube и скачайте его в формате MP4.</p>
    </header>

    <main>
      <div class="form-container">
        <input 
          type="text" 
          v-model="youtubeURL"
          placeholder="https://www.youtube.com/watch?v=..."
          @keyup.enter="downloadVideo"
          :disabled="isLoading"
        />
        <button @click="downloadVideo" :disabled="isLoading || !youtubeURL.trim()">
          {{ isLoading ? 'Обработка...' : 'Скачать' }}
        </button>
      </div>

      <div v-if="isLoading" class="status-container">
        <div class="loader"></div>
        <p>Пожалуйста, подождите, видео обрабатывается... Это может занять некоторое время.</p>
      </div>

      <div v-if="errorMessage" class="status-container error-message">
        <p>{{ errorMessage }}</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;
}

header h1 {
  font-size: 2.2em;
  color: #ff0000; 
  margin-bottom: 10px;
}
header p {
  color: #555;
  font-size: 1.1em;
}

.form-container {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

input {
  flex-grow: 1;
  padding: 12px 15px;
  font-size: 1.1em;
  border: 2px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.2s;
}
input:focus {
  border-color: #ff0000;
  outline: none;
}
input:disabled {
  background-color: #f5f5f5;
}

button {
  padding: 0 25px;
  font-size: 1.1em;
  font-weight: bold;
  color: white;
  background-color: #28a745;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #218838;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.status-container {
  margin-top: 40px;
  font-size: 1.1em;
  color: #444;
}

.error-message {
  color: #d93025;
  font-weight: bold;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #ff0000;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>