import React from "react";
import ReactDOM from "react-dom/client";

const rootElement = document.getElementById("root");

if (rootElement) {
	const root = ReactDOM.createRoot(rootElement as HTMLElement);

	root.render(
		<React.StrictMode>
			<div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
				<h1>Smart Mall Management System</h1>
				<p>Frontend shell is running. Start building features here.</p>
			</div>
		</React.StrictMode>
	);
}

