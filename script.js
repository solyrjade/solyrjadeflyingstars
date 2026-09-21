        const container = document.getElementById("star-container");
        const stars = new Map();

        function random(min, max) { return Math.random() * (max - min) + min; }

        function addStar(username) {
            if (!username || String(username).trim() === "") return;
            username = String(username).trim();

            if (stars.has(username)) return;

            const element = document.createElement("div");
            element.className = "star";
            element.innerHTML = `
                <span class="star-icon">⭐</span>
                <span class="username">@${escapeHtml(username)}</span>
            `;
            container.appendChild(element);

            const star = {
                element: element,
                x: random(50, window.innerWidth - 50),
                y: random(50, window.innerHeight - 50),
                vx: random(-0.45, 0.45),
                vy: random(-0.45, 0.45)
            };

            if (Math.abs(star.vx) < 0.15) star.vx = star.vx < 0 ? -0.25 : 0.25;
            if (Math.abs(star.vy) < 0.15) star.vy = star.vy < 0 ? -0.25 : 0.25;

            stars.set(username, star);
            element.style.left = star.x + "px";
            element.style.top = star.y + "px";
        }

        function removeStar(username) {
            if (!username || String(username).trim() === "") return;
            username = String(username).trim();
            if (!stars.has(username)) return;
            stars.get(username).element.remove();
            stars.delete(username);
        }

        function animate() {
            stars.forEach((star) => {
                star.x += star.vx;
                star.y += star.vy;
                const width = star.element.offsetWidth || 80;
                const height = star.element.offsetHeight || 30;

                if (star.x <= width / 2) { star.x = width / 2; star.vx *= -1; }
                if (star.x >= window.innerWidth - width / 2) { star.x = window.innerWidth - width / 2; star.vx *= -1; }
                if (star.y <= height / 2) { star.y = height / 2; star.vy *= -1; }
                if (star.y >= window.innerHeight - height / 2) { star.y = window.innerHeight - height / 2; star.vy *= -1; }

                star.element.style.left = star.x + "px";
                star.element.style.top = star.y + "px";
            });
            requestAnimationFrame(animate);
        }

        function escapeHtml(text) {
            return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        }

        function triggerAddStar() {
            const input = document.getElementById("username-input");
            addStar(input.value);
            input.value = "";
        }

        function triggerRemoveStar() {
            const input = document.getElementById("username-input");
            removeStar(input.value);
            input.value = "";
        }

        animate();

        // Direct TikFinity Local WebSocket Connection
        function connectTikFinity() {
            const ws = new WebSocket("ws://localhost:21213/");

            ws.onopen = () => {
                console.log("Connected directly to TikFinity!");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Trigger star on follow events
                    if (data.event === "follow" || data.event === "member") {
                        const user = data.nickname || data.uniqueId || data.username;
                        if (user) addStar(user);
                    }
                } catch (e) {
                    console.error("Error parsing TikFinity event", e);
                }
            };

            ws.onclose = () => {
                // Auto-reconnect if TikFinity restarts
                setTimeout(connectTikFinity, 3000);
            };
        }

        connectTikFinity();
