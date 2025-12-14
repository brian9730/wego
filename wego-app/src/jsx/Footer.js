import { Container, Row, Col } from "react-bootstrap";
import logo from "../images/logo.svg.png";


export const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center">
          <Col size={12} sm={6}>
            <img src={logo} alt="Logo" />
          </Col>
          <Col size={12} sm={6} className="text-center text-sm-end">

            <p>WE-GO © 2025. Your journey begins here.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}