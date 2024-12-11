
import React from "react";
import { useState, useEffect } from "react";
// react plugin used to create charts
import { Line, Pie } from "react-chartjs-2";
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardTitle,
    Row,
    Col,
} from "reactstrap";
// core components



function Dashboard(props) {
    

    return (
        <Col lg="4" md="6" sm="6" >
            <Card className={`card-stats  `} style={props.style}>
                <CardBody>
                    <Row>
                        <Col md="4" xs="5">
                            <div className="icon-big text-center icon-warning">
                                {props.Icon}  {/*e.g nc-globe text-warning*/}
                            </div>
                        </Col>
                        <Col md="8" xs="7">
                            <div className="numbers">
                                <p className="card-category">{props?.head}</p>
                                <CardTitle tag="p" style={{fontSize:"20px"}}>{props?.number}</CardTitle>
                                <p />
                            </div>
                        </Col>
                    </Row>
                </CardBody>
                {props?.footer &&
                    <CardFooter>
                        <hr />
                        <div className="stats">
                            <i className={props.footerIcon} /> {props.footer}
                        </div>
                    </CardFooter>
                }
            </Card>
        </Col>
    )
};

export default Dashboard;