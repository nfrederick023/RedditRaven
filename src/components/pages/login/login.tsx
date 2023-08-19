import { getCookieSetOptions } from "@client/utils/cookies";
import { useCookies } from "react-cookie";
import ButtonIcon from "@client/components/common/shared/button-icon";
import React, { FC, useState } from "react";
import TextField from "@client/components/common/shared/text-field";
import router from "next/router";
import styled from "styled-components";

const LoginPageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  padding-bottom: 100px;
`;

const LoginPageWrapper = styled.span`
  margin: 20px;
  width: 600px;
`;

const Checkbox = styled.input`
  vertical-align: text-bottom;
  accent-color: ${(p): string => p.theme.highlightLight};
`;

const CheckboxLabel = styled.label`
  display: flex;
  color: ${(p): string => p.theme.textContrast};
  user-select: none;
  transtion: 0.2s;
  h6 {
    position: relative;
    bottom: 1px;
    margin: auto;
  }

  &:hover {
    cursor: pointer;
    color: ${(p): string => p.theme.text};
  }
`;

const FlexBox = styled.div`
  display: flex;
  margin-top: 5px;
`;

const LoginButton = styled.span`
  display: flex;
  margin-left: auto;
`;

const LoginFailedMessage = styled.div`
  min-height: 20px;
`;

const login = async (password: string): Promise<Response> => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return response;
};

const LoginPage: FC = () => {
  const [password, setPassword] = useState("");
  const [, setCookie] = useCookies(["authToken"]);
  const [hasLoginFailed, setHasLoginFailed] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const onPasswordChange = (password: string): void => {
    setPassword(password);
  };

  const onIsPasswordShownChange = (): void => {
    setIsPasswordShown(!isPasswordShown);
  };

  const handleLogin = async (): Promise<void> => {
    setHasLoginFailed(false);
    const res = await login(password);
    if (res.ok) {
      setCookie("authToken", await res.text(), getCookieSetOptions());
      router.replace("/");
      router.reload();
    } else setHasLoginFailed(true);
  };

  return (
    <LoginPageContainer>
      <LoginPageWrapper>
        {hasLoginFailed ? <LoginFailedMessage>Login Failed!</LoginFailedMessage> : <LoginFailedMessage />}

        <TextField
          value={password}
          onChange={onPasswordChange}
          placeholder="Password"
          hideInput={!isPasswordShown}
          onEnter={handleLogin}
        />
        <FlexBox>
          <CheckboxLabel>
            <Checkbox type={"checkbox"} checked={isPasswordShown} onChange={onIsPasswordShownChange} />
            <h6>Show Password</h6>
          </CheckboxLabel>
          <LoginButton>
            <ButtonIcon textOn="Login " icon="bx bx-log-in" onClick={handleLogin} />
          </LoginButton>
        </FlexBox>
      </LoginPageWrapper>
    </LoginPageContainer>
  );
};

export default LoginPage;
