import { useRef } from "react";
import { apiRequest } from "../utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";



export default function Login() {
      const navigate = useNavigate();
    const { login } = useAuth();
      const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);


    const handleLogin = (e: any)=>{
        e.preventDefault();
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        if(!username || !password) {
            alert("Please enter both username and password");
            return;
        }
        const user = {
            "username": username,
            "password": password
        };
        apiRequest("POST", "login", user)
            .then((response) => {
                if (response.status === 200) {
                    // Redirect to home page or perform other actions
                    const userData = response.data;
                    login({
                        token: userData.token,
                        _id: userData.id
                    });
                    navigate("/");
                } else {
                    console.log("Login failed: " + response.statusText);
                    alert("Login failed " );
                }
            }).catch((error) => {
                console.error("Error during login:", error);
                alert("Invalid username or password");  
            });
    };


    return(
        <div>
            <h1>Login:</h1>
            <form data-testid="login_form" onSubmit={handleLogin}>
        <div>
          username
            <input
            type="text"
            ref={usernameRef}
            name="Username"
            data-testid = "login_form_username"

          />
        </div>
        <div>
          password
            <input
            type="password"
            ref={passwordRef}
            name="Password"
            data-testid = "login_form_password"
          />
        </div>
        <button type="submit" data-testid = "login_form_login">login</button>
      </form>

        </div>
    );
}
