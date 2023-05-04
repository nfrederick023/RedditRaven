import { createGlobalStyle } from "styled-components";
import theme from "@client/utils/themes";

const GlobalStyle = createGlobalStyle`
html {
  font-family: 'Montserrat';
  background-color: ${theme.background};
  color: ${theme.text};
}

input, textarea, select { 
  font-family:inherit; 
  font-size: inherit; 
}

// prevents content shift on scrollbar
body {
  width: calc(100vw - 15px);
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
  border-color: ${theme.textContrast};
  margin-top: 3px;
  margin-bottom: 15px;
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
    background-color: ${theme.highlightLight} !important;
  }
}


.MuiClockPointer-root, .MuiClock-pin, .MuiClockPointer-thumb, .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton.Mui-selected{
  background-color: ${theme.highlightDark} !important;
}


.MuiClockPointer-thumb {
  border-color: ${theme.highlightDark} !important;
}
.MuiPaper-root {
    background-color: ${theme.backgroundContrast} !important;

}

 .MuiDialog-paper {
    background-color: ${theme.background} !important;
    box-shadow: 0px 0px 0px 0px !important;
 }

 .MuiTypography-root, .MuiClockNumber-root, .MuiSvgIcon-root, .MuiPickersFadeTransitionGroup-root, .MuiButtonBase-root {
  color: ${theme.text} !important;
 }

 .MuiInputBase-input {
  font-family: "Montserrat" !important;

 }
`;

export default GlobalStyle;
