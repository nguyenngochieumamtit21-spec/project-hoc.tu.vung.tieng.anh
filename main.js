  // Hàm tải danh sách từ vựng từ localStorage
        function loadVocab() {
            const vocabList = JSON.parse(localStorage.getItem('vocabList')) || [];
            const listElement = document.getElementById('vocabList');
            listElement.innerHTML = '';
            vocabList.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${index + 1}. ${item.word} - ${item.meaning}</span><button class="delete-btn" onclick="removeVocab('${item.word}')">Xóa</button>`;
                listElement.appendChild(li);
            });
            return vocabList;
        }

        // Hàm kiểm tra từ có tồn tại trong từ điển tiếng Anh không (sử dụng Free Dictionary API)
        async function isValidEnglishWord(word) {
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
                return response.ok; // Nếu API trả về OK, từ hợp lệ
            } catch (error) {
                console.error('Lỗi kiểm tra từ:', error);
                return false;
            }
        }

        // Hàm dịch từ vựng sang tiếng Việt (sử dụng MyMemory API)
        async function translateWord(word) {
            try {
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
                const data = await response.json();
                return data.responseData.translatedText || 'Không tìm thấy nghĩa';
            } catch (error) {
                console.error('Lỗi dịch:', error);
                return 'Không tìm thấy nghĩa';
            }
        }

        // Hàm thêm từ vựng
        async function addVocab() {
            const input = document.getElementById('vocabInput');
            const word = input.value.trim().toLowerCase(); // Chuyển về chữ thường để kiểm tra trùng lặp
            const message = document.getElementById('message');
            
            if (!word) {
                message.textContent = 'Vui lòng nhập từ vựng!';
                return;
            }
            
            // Kiểm tra regex cơ bản (chỉ chữ cái a-z)
            const regex = /^[a-zA-Z]+$/;
            if (!regex.test(word)) {
                message.textContent = 'Từ không hợp lệ hoặc không phải tiếng Anh. Vui lòng nhập từ tiếng Anh đúng!';
                return;
            }
            
            let vocabList = loadVocab();
            const existing = vocabList.find(item => item.word === word);
            
            if (existing) {
                message.textContent = 'Từ này đã được thêm rồi!';
                return;
            }
            
            // Hiển thị loading
            message.textContent = 'Đang kiểm tra và dịch nghĩa...';
            message.classList.add('loading');
            
            // Kiểm tra từ hợp lệ
            const valid = await isValidEnglishWord(word);
            if (!valid) {
                message.classList.remove('loading');
                message.textContent = 'Từ không hợp lệ hoặc không phải tiếng Anh. Vui lòng nhập từ tiếng Anh đúng!';
                return;
            }
            
            // Dịch nghĩa
            const meaning = await translateWord(word);
            
            // Thêm vào danh sách
            vocabList.push({ word: word, meaning: meaning });
            localStorage.setItem('vocabList', JSON.stringify(vocabList));
            loadVocab(); // Cập nhật danh sách
            
            message.classList.remove('loading');
            message.textContent = 'Đã thêm từ: ' + word;
            
            input.value = ''; // Xóa ô input
        }

        // Hàm xóa từ vựng
        function removeVocab(word) {
            let vocabList = JSON.parse(localStorage.getItem('vocabList')) || [];
            vocabList = vocabList.filter(item => item.word !== word); // Lọc bỏ từ cần xóa
            localStorage.setItem('vocabList', JSON.stringify(vocabList));
            loadVocab(); // Cập nhật danh sách
            document.getElementById('message').textContent = 'Đã xóa từ: ' + word;
        }

        // Tải danh sách khi trang load
        window.onload = loadVocab;