"use client";

import React, { forwardRef } from "react";

const POPrintTemplate = forwardRef(({ po, hidden = true }, ref) => {
  if (!po) return null;

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(date));
  };

  const calculateTotals = () => {
    let base = 0;
    let gstSum = 0;
    po.items.forEach((item) => {
      const lineBase = item.agreedRate * item.quantity;
      const lineGst = lineBase * ((item.taxPercent || 18) / 100);
      base += lineBase;
      gstSum += lineGst;
    });
    return {
      base: base.toFixed(2),
      gst: gstSum.toFixed(2),
      grand: (base + gstSum).toFixed(2),
    };
  };

  const totals = calculateTotals();

  const printStyles = {
    width: "210mm",
    minHeight: "297mm",
    padding: "10mm 15mm",
    backgroundColor: "#ffffff",
    color: "#000000",
    fontFamily: "'Helvetica', sans-serif",
    fontSize: "10pt",
    boxSizing: "border-box",
    ...(hidden
      ? {
          position: "absolute",
          left: "-9999px",
          top: 0,
        }
      : {
          position: "relative",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }),
  };

  return (
    <div ref={ref} style={printStyles}>
      {/* Header Section */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "5px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ textAlign: "left", width: "70%" }}>
              <div
                style={{
                  fontFamily: "'Bell MT', serif",
                  fontSize: "16pt",
                  fontWeight: "bold",
                  color: "#F25700",
                  whiteSpace: "nowrap",
                }}
              >
                {po.factoryName ||
                  po.factoryId?.name ||
                  "TECHSER POWER SOLUTIONS PRIVATE LIMITED"}
              </div>
            </td>
            <td style={{ textAlign: "right", verticalAlign: "middle" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <img
                  src="/logo1.jpeg"
                  alt="Logo 1"
                  style={{ height: "50px", width: "auto" }}
                />
                <img
                  src="/logo2.jpg"
                  alt="Logo 2"
                  style={{ height: "50px", width: "auto" }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          fontSize: "11pt",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "10px",
          textDecoration: "underline",
          color: "#0000FF",
        }}
      >
        PURCHASE ORDER
      </div>

      {/* Vendor & PO Details */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #888",
          marginBottom: "10px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "55%",
                border: "1px solid #888",
                padding: "10px",
                verticalAlign: "top",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                M/s. {po.supplierId?.name || "Supplier Name"}
              </div>
              <div
                style={{
                  fontSize: "9pt",
                  whiteSpace: "pre-line",
                  lineHeight: "1.4",
                }}
              >
                {po.supplierId?.address || "Supplier Address Not Available"}
                {po.supplierId?.gstNumber &&
                  `\nGST: ${po.supplierId.gstNumber}`}
              </div>
            </td>
            <td
              style={{
                width: "45%",
                border: "1px solid #888",
                padding: "10px",
                verticalAlign: "top",
              }}
            >
              <table style={{ width: "100%", fontSize: "9pt" }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "bold", width: "90px" }}>
                      PO No.
                    </td>
                    <td>: {po.poNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Date</td>
                    <td>: {formatDate(po.createdAt)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Your Qtn Ref</td>
                    <td>: {po.quotationRef || "As Discussed"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Person Resp.</td>
                    <td>
                      :{" "}
                      <b>
                        {po.responsiblePerson ||
                          "Mr. V. GURUPRASAD / 9902434248"}
                      </b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: "9pt", marginBottom: "5px" }}>
        With ref. to your quotation, please supply the following items, subject
        to conditions mentioned hereunder.
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #888",
          marginBottom: "5px",
        }}
      >
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr style={{ fontSize: "9pt", fontWeight: "bold" }}>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                width: "30px",
                textAlign: "center",
              }}
            >
              S.No
            </th>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "left",
              }}
            >
              Material Description
            </th>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                width: "80px",
                textAlign: "center",
              }}
            >
              Make
            </th>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                width: "50px",
                textAlign: "center",
              }}
            >
              QTY
              <br />
              [Nos]
            </th>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                width: "70px",
                textAlign: "right",
              }}
            >
              RATE
              <br />
              [per Unit]
            </th>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                width: "50px",
                textAlign: "center",
              }}
            >
              GST
              <br />
              [%]
            </th>
            <th
              style={{
                border: "1px solid #888",
                padding: "5px",
                width: "90px",
                textAlign: "right",
              }}
            >
              TOTAL
              <br />
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((item, index) => (
            <tr key={index} style={{ fontSize: "9pt" }}>
              <td
                style={{
                  border: "1px solid #888",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                {index + 1}
              </td>
              <td style={{ border: "1px solid #888", padding: "5px" }}>
                {item.supplierItemName || item.itemName}
              </td>
              <td
                style={{
                  border: "1px solid #888",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                {item.make || "Standard"}
              </td>
              <td
                style={{
                  border: "1px solid #888",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  border: "1px solid #888",
                  padding: "5px",
                  textAlign: "right",
                }}
              >
                {item.agreedRate.toFixed(2)}
              </td>
              <td
                style={{
                  border: "1px solid #888",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                {item.taxPercent || 18}%
              </td>
              <td
                style={{
                  border: "1px solid #888",
                  padding: "5px",
                  textAlign: "right",
                }}
              >
                {(
                  item.agreedRate *
                  item.quantity *
                  (1 + (item.taxPercent || 18) / 100)
                ).toFixed(2)}
              </td>
            </tr>
          ))}
          {/* Summary Rows */}
          <tr>
            <td
              colSpan="6"
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              Total Base Amount
            </td>
            <td
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "right",
              }}
            >
              ₹{totals.base}
            </td>
          </tr>
          <tr>
            <td
              colSpan="6"
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              Total GST
            </td>
            <td
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "right",
              }}
            >
              ₹{totals.gst}
            </td>
          </tr>
          <tr style={{ backgroundColor: "#fdfdfd" }}>
            <td
              colSpan="6"
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              Grand Total
            </td>
            <td
              style={{
                border: "1px solid #888",
                padding: "5px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              ₹{totals.grand}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Terms & Conditions */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #888",
          marginBottom: "10px",
        }}
      >
        <tbody style={{ fontSize: "9pt" }}>
          <tr>
            <td
              style={{ padding: "3px 5px", width: "120px", fontWeight: "bold" }}
            >
              Price Basis
            </td>
            <td>: {po.priceBasis || "FOR BANGALORE"}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 5px", fontWeight: "bold" }}>
              Payment Terms
            </td>
            <td>: {po.paymentTerms || "60 DAYS FROM THE DATE OF DELIVERY"}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 5px", fontWeight: "bold" }}>Tax</td>
            <td>: {po.taxTerms || "GST AS MENTIONED ABOVE"}</td>
          </tr>
          <tr>
            <td style={{ padding: "3px 5px", fontWeight: "bold" }}>Delivery</td>
            <td>
              :{" "}
              <b>
                {po.deliveryTimeline ||
                  "ON OR BEFORE 01/12/2025 TO THE BELOW MENTIONED ADDRESS"}
              </b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 5px", fontWeight: "bold" }}>
              Packing Material
            </td>
            <td>
              :{" "}
              <b>
                {po.packingMaterial ||
                  "KINDLY DON'T USE PLASTIC MATERIAL & THERMOCOL"}
              </b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 5px", fontWeight: "bold" }}>
              Jurisdiction
            </td>
            <td>
              :{" "}
              <b>
                {po.jurisdiction ||
                  "ALL LEGAL DISPUTE SUBJECT TO BANGALORE CITY JURISDICTION ONLY"}
              </b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 5px", fontWeight: "bold" }}>
              Inspection
            </td>
            <td>: {po.inspectionTerms || "AT OUR WORK"}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer Signatures */}
      <table
        style={{
          width: "100%",
          border: "none",
          marginTop: "15px",
          marginBottom: "15px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: "50%" }}></td>
            <td
              style={{
                width: "50%",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "9pt",
              }}
            >
              For{" "}
              {po.factoryName ||
                po.factoryId?.name ||
                "TECHSER POWER SOLUTIONS PRIVATE LIMITED"}
              <br />
              <br />
              <br />
              <br />
              Authorized Signatory
            </td>
          </tr>
        </tbody>
      </table>

      {/* Company GST */}
      <div
        style={{
          width: "100%",
          border: "1px solid #888",
          textAlign: "center",
          padding: "5px",
          fontWeight: "bold",
          fontSize: "9pt",
          marginBottom: "5px",
        }}
      >
        GST REGISTRATION NUMBER:{" "}
        {po.factoryGstNumber || po.factoryId?.gstNumber || "29AABCT0359D1Z1"}
      </div>

      {/* Addresses */}
      <table
        style={{
          width: "100%",
          border: "1px solid #888",
          borderCollapse: "collapse",
          fontSize: "8.5pt",
          textAlign: "center",
        }}
      >
        <tbody>
          <tr style={{ borderBottom: "1px solid #888" }}>
            <td style={{ padding: "8px" }}>
              <span
                style={{
                  color: "#ff0000",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
              >
                BILLING ADDRESS
              </span>
              <br />
              <b>
                {po.factoryBillingAddress ||
                  po.factoryId?.billingAddress ||
                  "WORKS: # 17/b, HOOTAGALLI INSUSTRIAL AREA, HOOTAGALLI, MYSORE-570018. PH: 0821-2544527; EMAIL : VINAY@TECHSER.COM"}
              </b>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px" }}>
              <span
                style={{
                  color: "#ff0000",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
              >
                DELIVERY ADDRESS
              </span>
              <br />
              <b>
                {po.deliveryAddress ||
                  (po.deliveryStoreName &&
                    po.factoryId?.stores?.find(
                      (s) => s.name === po.deliveryStoreName,
                    )?.address) ||
                  "No.12/1, Techser House,5th Cross,, MES Ring Rd, Bengaluru, Karnataka 560013"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tracking Box */}
      <table
        style={{
          width: "100%",
          border: "1px solid #888",
          borderCollapse: "collapse",
          marginTop: "5px",
          fontSize: "8pt",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "33.3%",
                padding: "5px",
                borderRight: "1px solid #888",
              }}
            >
              <strong>Stores Indent #:</strong> {po.indentNumber || "534"}
            </td>
            <td
              style={{
                width: "33.3%",
                padding: "5px",
                borderRight: "1px solid #888",
              }}
            >
              <strong>Indent Date:</strong> {po.indentDate || "04-11-2025"}
            </td>
            <td style={{ width: "33.3%", padding: "5px" }}>
              <strong>GIR # with date:</strong> {po.girNo || "245"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

POPrintTemplate.displayName = "POPrintTemplate";

export default POPrintTemplate;
