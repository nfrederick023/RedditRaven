import { AppProps } from "next/app";
import { CookieTypes } from "@client/utils/types";
import { Cookies, CookiesProvider } from "react-cookie";
import { ReactElement } from "react";
import { darkTheme } from "@client/utils/themes";
import { getCookieDefault, getCookieSetOptions } from "../utils/cookies";
import { useRouter } from "next/router";
import Header from "@client/components/common/layout/header/header";
import React from "react";
import Sidebar from "@client/components/common/layout/sidebar/sidebar";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
html {
  font-family: 'Montserrat';
  background-color: ${(p): string => p.theme.background};
  color: ${(p): string => p.theme.text};
}

input, textarea, select { 
  font-family:inherit; 
  font-size: inherit; 
}

// prevents content shift on scrollbar
body {
  width: calc(100vw - 17px);
}

// hide scrollbar on 100vh
* {
    box-sizing: border-box;
}

// hide scrollbar on 100vh
html, body {
  margin: 0px;
  padding: 0px;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0px;
}

h1 {
  line-height: 75%;
  font-size: 1.9em;
  font-weight: 900;
}

h2 {
  font-size: 1.7em;
  font-weight: 900;
  margin-top: 25px;
}

h5{
  font-size: 1em;
  font-weight: 500;
}

h6{
  font-size: 0.83em;
  font-weight: 500;
}

hr{
  border-color: ${(p): string => p.theme.textContrast};
  margin-top: 3px;
  margin-bottom: 15px;
}

a {
  text-decoration: none;
}

/* unvisited link */
a:link {
  color: ${(p): string => p.theme.textContrast};
}

/* visited link */
a:visited {
  color: ${(p): string => p.theme.textContrast};
}

/* mouse over link */
a:hover {
   color: ${(p): string => p.theme.text};
}

/* selected link */
a:active {
  color: ${(p): string => p.theme.highlightDark};
}

.sidebar-button {
    background: linear-gradient(to top right, #4481eb, #04befe);
    border: none;
    border-radius: 10px;
    color: white;
    font-family: 'Montserrat SemiBold', sans-serif;
    text-align: left;
    height: 45px;
    width: 200px;
    padding-left: 30px;
    font-size: large;
}

.MuiPickersDay-root, .MuiPickersYear-yearButton{
  transition: all 0.1s ease-in;

  &:hover {
    background-color: ${(p): string => p.theme.highlightLight} !important;
  }
}


.MuiClockPointer-root, .MuiClock-pin, .MuiClockPointer-thumb, .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton.Mui-selected{
  background-color: ${(p): string => p.theme.highlightDark} !important;
}


.MuiClockPointer-thumb {
  border-color: ${(p): string => p.theme.highlightDark} !important;
}
.MuiPaper-root {
    background-color: ${(p): string => p.theme.backgroundContrast} !important;

}

 .MuiDialog-paper {
    background-color: ${(p): string => p.theme.background} !important;
    box-shadow: 0px 0px 0px 0px !important;
 }

 .MuiTypography-root, .MuiClockNumber-root, .MuiSvgIcon-root, .MuiPickersFadeTransitionGroup-root, .MuiButtonBase-root {
  color: ${(p): string => p.theme.text} !important;
 }

 .MuiInputBase-input {
  font-family: "Montserrat" !important;

 }
`;

const LayoutWrapper = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
`;
const ContentWrapper = styled.div`
  height: inherit;
  width: inherit;
  margin: 20px;
  overflow: hidden;
  max-width: 1600px;
`;

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => {
  const router = useRouter();
  const _cookies = new Cookies();
  const allCookieTypes: CookieTypes[] = ["authToken"];

  allCookieTypes.forEach((cookieType) => {
    if (!_cookies.get(cookieType)) _cookies.set(cookieType, getCookieDefault(cookieType), getCookieSetOptions());
  });

  return (
    <>
      <title>RedditRaven</title>
      <CookiesProvider cookies={_cookies}>
        <ThemeProvider theme={darkTheme}>
          <GlobalStyle />
          <LayoutWrapper>
            {router.pathname.includes("/login") ? (
              <Component {...pageProps} />
            ) : (
              <>
                <Sidebar />
                <MainContent>
                  <ContentWrapper>
                    <Header />
                    <Component {...pageProps} />
                  </ContentWrapper>
                </MainContent>
              </>
            )}
          </LayoutWrapper>
        </ThemeProvider>
      </CookiesProvider>
    </>
  );
};

export default MyApp;
