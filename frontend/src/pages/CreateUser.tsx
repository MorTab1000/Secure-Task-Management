import { useRef } from "react";
import { apiRequest } from "../utils";
import { useNavigate } from "react-router-dom";

export default function CreateUser() {
	const navigate = useNavigate();
	const handleSignUp = (e: any) => {
		e.preventDefault();
		const nameValue = name.current?.value;
		const emailValue = email.current?.value;
		const usernameValue = usernameRef.current?.value;
		const passwordValue = passwordRef.current?.value;
		if (!nameValue || !emailValue || !usernameValue || !passwordValue) {
			alert("Please fill in all fields");
			return;
		}
		const user = {
			name: nameValue,
			email: emailValue,
			username: usernameValue,
			password: passwordValue,
		};
		apiRequest("POST", "users", user)
			.then((response) => {
				if (response.status === 201) {
					// User created successfully
					navigate("/");
				} else {
					console.log("User creation failed: " + response.statusText);
					alert("User creation failed: " + response.data);
				}
			})
			.catch((error) => {
				console.error("Error during user creation:", error);
				alert("Error creating user: " + error.response?.data.error);
			});
	};
	const name = useRef<HTMLInputElement>(null);
	const email = useRef<HTMLInputElement>(null);
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	return (
		<div>
			<h1>Sign Up:</h1>
			<form data-testid="create_user_form" onSubmit={handleSignUp}>
				<div>
					<div>
						<label>name</label>
						<input
							type="text"
							ref={name}
							name="Name"
							data-testid="create_user_form_name"
						/>
					</div>
					<div>
						{" "}
						<label>email</label>
						<input
							type="email"
							ref={email}
							name="Email"
							data-testid="create_user_form_email"
						/>
					</div>
					<div>
						{" "}
						<label>username</label>
						<input
							type="text"
							ref={usernameRef}
							name="Username"
							data-testid="create_user_form_username"
						/>
					</div>
				</div>
				<div>
					<label>password</label>
					<input
						type="password"
						ref={passwordRef}
						name="Password"
						data-testid="create_user_form_password"
					/>
				</div>
				<button type="submit" data-testid="create_user_form_create_user">
					Create User
				</button>
			</form>
		</div>
	);
}
