// Import necessary React and third-party libraries and components
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { AccountCircle, School, Group } from "@mui/icons-material";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userRelated/userHandle";
import Popup from "../components/Popup";

// Define the functional component ChooseUser, which takes a prop 'visitor'
const ChooseUser = ({ visitor }) => {
  // Initialize Redux-related variables and functions
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";
  const email = "yogendra@12";

  // Get user-related information from the Redux store using useSelector
  const { status, currentUser, currentRole } = useSelector(
    (state) => state.user
  );

  // State variables to manage loading, popup visibility, and popup message
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  // Function to handle user selection and navigate accordingly
  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        // If the user is a guest, set predefined values and dispatch login

        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        // If not a guest, navigate to the Admin login page
        navigate("/Adminlogin");
      }
    } else if (user === "Student") {
      // Similar logic for the Student role
      // ...
      navigate("/Studentlogin");
    } else if (user === "Teacher") {
      // Similar logic for the Teacher role
      navigate("/Teacherlogin");
    }
  };

  // useEffect to handle navigation after login or show error popup
  useEffect(() => {
    if (status === "success" || currentUser !== null) {
      // If login is successful, navigate based on the user's role
      if (currentRole === "Admin") {
        navigate("/Admin/dashboard");
      } else if (currentRole === "Student") {
        navigate("/Student/dashboard");
      } else if (currentRole === "Teacher") {
        navigate("/Teacher/dashboard");
      }
    } else if (status === "error") {
      // If there's a login error, set loader to false, show popup with error message
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  // JSX for rendering the component
  return (
    <StyledContainer>
      <Container>
        {/* Grid layout to display user options */}
        <Grid container spacing={2} justifyContent="center">
          {/* Admin option */}
          <Grid item xs={12} sm={6} md={4}>
            <div onClick={() => navigateHandler("Admin")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <AccountCircle fontSize="small" />
                </Box>
                <StyledTypography>Admin</StyledTypography>
                Login as an administrator to access the dashboard to manage app
                data.
              </StyledPaper>
            </div>
          </Grid>
          {/* Student option */}
          <Grid item xs={12} sm={6} md={4}>
            {/* StyledPaper for consistent styling */}
            <StyledPaper elevation={3}>
              <div onClick={() => navigateHandler("Student")}>
                <Box mb={2}>
                  <School fontSize="large" />
                </Box>
                <StyledTypography>Student</StyledTypography>
                Login as a student to explore course materials and assignments.
              </div>
            </StyledPaper>
          </Grid>
          {/* Teacher option */}
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3}>
              <div onClick={() => navigateHandler("Teacher")}>
                <Box mb={2}>
                  <Group fontSize="large" />
                </Box>
                <StyledTypography>Teacher</StyledTypography>
                Login as a teacher to create courses, assignments, and track
                student progress.
              </div>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
      {/* Loader backdrop while processing login */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        Please Wait
      </Backdrop>
      {/* Popup for displaying error messages */}
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </StyledContainer>
  );
};

// Export the ChooseUser component as the default export
export default ChooseUser;

// Styled components for consistent styling
const StyledContainer = styled.div`
  background: linear-gradient(to bottom, #411d70, #19118b);
  height: 120vh;
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const StyledPaper = styled(Paper)`
  // Styling for the Paper component
  padding: 20px;
  text-align: center;
  background-color: #1f1f38;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;

  &:hover {
    // Hover effect
    background-color: #2c2c6c;
    color: white;
  }
`;

const StyledTypography = styled.h2`
  // Styling for the Typography component
  margin-bottom: 10px;
`;

// End of code
