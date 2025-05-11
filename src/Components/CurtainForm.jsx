import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { PlusCircle, Trash2, Loader2, Printer, Download, Send } from "lucide-react";
import leftimage from "../../src/images/leftimage.jpg";

const CurtainForm = () => {
  // Customer Info State
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    address: "",
  });

  const [rooms, setRooms] = useState([
    {
      id: Date.now(),
      room: "",
      customRoom: "",
      items: [
        {
          id: uuidv4(),
          type: "",
          formData: {
            width: "",
            heightLeft: "",
            heightCenter: "",
            heightRight: "",
            style: "",
            fabricCode: "",
            opening: "",
            fabricType: "",
            sellingPrice: "",
            remarks: "",
            item: "",
            unit: "",
          },
        },
      ],
    },
  ]);
  const [discount, setDiscount] = useState("");
  const [curtainStyles, setCurtainStyles] = useState([]);
  const [curtainFabricCodes, setCurtainFabricCodes] = useState([]);
  const [curtainFabricTypes, setCurtainFabricTypes] = useState([]);
  const [blindStyles, setBlindStyles] = useState([]);
  const [blindData, setBlindData] = useState([]);
  const [blindFabricTypes, setBlindFabricTypes] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openings = ["Left to Right", "Right to Left", "Center Split"];

  const headers = {
    "X-Tadabase-App-id": "oOjD1mm1rB",
    "X-Tadabase-App-Key": "bk9nJWXUemy7",
    "X-Tadabase-App-Secret": "UzbXvsZWbS10hkwzQgErMklUpdUopAhR",
    "Content-Type": "application/json",
  };

  // Handle Customer Info Input Changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData({
      ...customerData,
      [name]: value,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const curtainStyleResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/lGArg7rmR6/records",
          { headers }
        );
        const curtainStyleData = await curtainStyleResponse.json();
        setCurtainStyles(
          [...new Set(curtainStyleData.items.map((item) => item.field_42))].filter(Boolean)
        );

        const curtainFabricResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/eykNOvrDY3/records",
          { headers }
        );
        const curtainFabricData = await curtainFabricResponse.json();
        setCurtainFabricCodes(
          [...new Set(curtainFabricData.items.map((item) => item.field_45))].filter(Boolean)
        );
        setCurtainFabricTypes(
          [...new Set(curtainFabricData.items.map((item) => item.field_47))].filter(Boolean)
        );

        const blindResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/VX9QoerwYv/records",
          { headers }
        );
        const blindResponseData = await blindResponse.json();
        setBlindStyles(
          [...new Set(blindResponseData.items.map((item) => item.field_96))].filter(Boolean)
        );
        setBlindData(blindResponseData.items);
        setBlindFabricTypes(
          [...new Set(blindResponseData.items.map((item) => item.field_79))].filter(Boolean)
        );

        const accessoriesResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/q3kjZVj6Vb/records",
          { headers }
        );
        const accessoriesData = await accessoriesResponse.json();
        setAccessories(
          accessoriesData.items.map((item) => ({
            item: item.field_71,
            unit: item.field_72,
            cost: item.field_73,
          }))
        );
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    fetchData();
  }, []);

  const areRequiredFieldsFilled = (item) => {
    const { type, formData } = item;
    const {
      width,
      heightLeft,
      heightCenter,
      heightRight,
      style,
      fabricCode,
      opening,
      fabricType,
      item: accessoryItem,
      unit,
    } = formData;

    if (type === "Accessories") {
      return accessoryItem && unit;
    } else if (type === "Curtains" || type === "Blinds") {
      return (
        width &&
        heightLeft &&
        heightCenter &&
        heightRight &&
        style &&
        fabricCode &&
        opening &&
        fabricType
      );
    }
    return false;
  };

  // Validate all required fields (customer and form)
  const isFormValid = () => {
    return (
      customerData.name &&
      customerData.email &&
      customerData.phone &&
      customerData.date &&
      customerData.address &&
      rooms.every((room) =>
        room.items.every(
          (item) => areRequiredFieldsFilled(item) && item.formData.sellingPrice
        )
      )
    );
  };

  const submitRoomData = async (room, item) => {
    setLoadingPrices((prev) => ({ ...prev, [item.id]: true }));

    const invoiceId = uuidv4();
    const roomId = uuidv4();
    const windowId = uuidv4();

    const payload = {
      Invoice_Id: invoiceId,
      Room: [
        {
          Room_Id: roomId,
          Room_Name: room.room === "Other" ? room.customRoom : room.room,
          Window: [
            {
              Winodw_Id: windowId,
              type: item.type,
              Width: item.type === "Accessories" ? "" : item.formData.width,
              Height: item.type === "Accessories" ? "" : item.formData.heightLeft,
              "Height Center": item.type === "Accessories" ? "" : item.formData.heightCenter,
              "Height Right": item.type === "Accessories" ? "" : item.formData.heightRight,
              Style: item.type === "Accessories" ? "" : item.formData.style,
              Fabric_Code: item.type === "Accessories" ? "" : item.formData.fabricCode,
              Opening: item.type === "Accessories" ? "" : item.formData.opening,
              Fabric_Type: item.type === "Accessories" ? "" : item.formData.fabricType,
              Item: item.formData.item,
              Unit: item.formData.unit,
              Remarks: item.formData.remarks || "None",
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        "https://hook.eu2.make.com/sm9hwk03a3yvat1hwq0yptrb2te5dwja",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const sellingPriceKey =
        item.type === "Curtains"
          ? "Selling Price 1 (incl VAT) Curtain"
          : `Selling Price (incl VAT) ${item.type}`;
      const sellingPrice = data[sellingPriceKey];

      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === room.id
            ? {
                ...r,
                items: r.items.map((i) =>
                  i.id === item.id
                    ? {
                        ...i,
                        formData: {
                          ...i.formData,
                          sellingPrice,
                        },
                      }
                    : i
                ),
              }
            : r
        )
      );
    } catch (error) {
      console.error("Error submitting room data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch selling price. Please try again.",
      });
    } finally {
      setLoadingPrices((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const submitOrder = async () => {
    setIsSubmitting(true);

    // Validate form
    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill out all required customer information and ensure all items have required fields and prices calculated.",
      });
      setIsSubmitting(false);
      return;
    }

    // Calculate total price
    const totalPrice = rooms.reduce(
      (sum, room) =>
        sum +
        room.items.reduce(
          (itemSum, item) => itemSum + (parseFloat(item.formData.sellingPrice) || 0),
          0
        ),
      0
    );

    // Construct payload
    const invoiceId = uuidv4();
    const payload = {
      Invoice_Id: invoiceId,
      Customer: {
        Name: customerData.name,
        Email: customerData.email,
        Phone: customerData.phone,
        Date: customerData.date,
        Address: customerData.address,
      },
      Price_Details: {
        Subtotal: calculateTotalCost(),
        VAT: calculateVAT(),
        Discount: parseFloat(discount) || 0,
        Final_Total: calculateFinalTotal(),
      },
      Room: rooms.map((room) => ({
        Room_Id: uuidv4(),
        Room_Name: room.room === "Other" ? room.customRoom : room.room,
        Window: room.items.map((item) => ({
          Winodw_Id: uuidv4(),
          type: item.type,
          Width: item.type === "Accessories" ? "" : item.formData.width,
          Height: item.type === "Accessories" ? "" : item.formData.heightLeft,
          "Height Center": item.type === "Accessories" ? "" : item.formData.heightCenter,
          "Height Right": item.type === "Accessories" ? "" : item.formData.heightRight,
          Style: item.type === "Accessories" ? "" : item.formData.style,
          Fabric_Code: item.type === "Accessories" ? "" : item.formData.fabricCode,
          Opening: item.type === "Accessories" ? "" : item.formData.opening,
          Fabric_Type: item.type === "Accessories" ? "" : item.formData.fabricType,
          Item: item.formData.item,
          Unit: item.formData.unit,
          Selling_Price: parseFloat(item.formData.sellingPrice) || 0,
          Remarks: item.formData.remarks || "None",
        })),
      })),
    };

    try {
      const response = await fetch(
        "https://hook.eu2.make.com/3gji3apxav0hijkhk24jmoo5ttl5q4sf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Order submission failed");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Order submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form and customer data
      setCustomerData({
        name: "",
        email: "",
        phone: "",
        date: "",
        address: "",
      });
      setRooms([
        {
          id: Date.now(),
          room: "",
          customRoom: "",
          items: [
            {
              id: uuidv4(),
              type: "",
              formData: {
                width: "",
                heightLeft: "",
                heightCenter: "",
                heightRight: "",
                style: "",
                fabricCode: "",
                opening: "",
                fabricType: "",
                sellingPrice: "",
                remarks: "",
                item: "",
                unit: "",
              },
            },
          ],
        },
      ]);
      setDiscount("");
    } catch (error) {
      console.error("Error submitting order:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    rooms.forEach((room) => {
      room.items.forEach((item) => {
        if (
          areRequiredFieldsFilled(item) &&
          !item.formData.sellingPrice &&
          !loadingPrices[item.id]
        ) {
          submitRoomData(room, item);
        }
      });
    });
  }, [rooms]);

  const handleItemChange = (roomId, itemId, field, value) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              items: room.items.map((item) =>
                item.id === itemId
                  ? field === "type"
                    ? {
                        ...item,
                        [field]: value,
                        formData: {
                          width: "",
                          heightLeft: "",
                          heightCenter: "",
                          heightRight: "",
                          style: "",
                          fabricCode: "",
                          opening: "",
                          fabricType: "",
                          sellingPrice: "",
                          remarks: "",
                          item: "",
                          unit: "",
                        },
                      }
                    : field === "item"
                    ? {
                        ...item,
                        formData: {
                          ...item.formData,
                          item: value,
                          unit: "",
                          sellingPrice: "",
                        },
                      }
                    : field === "style" && item.type === "Blinds"
                    ? {
                        ...item,
                        formData: {
                          ...item.formData,
                          style: value,
                          fabricCode: "",
                          fabricType: "",
                          sellingPrice: "",
                        },
                      }
                    : {
                        ...item,
                        formData: {
                          ...item.formData,
                          [field]: value,
                          sellingPrice:
                            field !== "remarks" ? "" : item.formData.sellingPrice,
                        },
                      }
                  : item
              ),
            }
          : room
      )
    );
  };

  const handleRoomChange = (roomId, field, value) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              [field]: value,
            }
          : room
      )
    );
  };

  const addRoom = () => {
    setRooms((prevRooms) => [
      ...prevRooms,
      {
        id: Date.now(),
        room: "",
        customRoom: "",
        items: [
          {
            id: uuidv4(),
            type: "",
            formData: {
              width: "",
              heightLeft: "",
              heightCenter: "",
              heightRight: "",
              style: "",
              fabricCode: "",
              opening: "",
              fabricType: "",
              sellingPrice: "",
              remarks: "",
              item: "",
              unit: "",
            },
          },
        ],
      },
    ]);
  };

  const removeRoom = (roomId) => {
    if (rooms.length > 1) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
    }
  };

  const addItemToRoom = (roomId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              items: [
                ...room.items,
                {
                  id: uuidv4(),
                  type: "",
                  formData: {
                    width: "",
                    heightLeft: "",
                    heightCenter: "",
                    heightRight: "",
                    style: "",
                    fabricCode: "",
                    opening: "",
                    fabricType: "",
                    sellingPrice: "",
                    remarks: "",
                    item: "",
                    unit: "",
                  },
                },
              ],
            }
          : room
      )
    );
  };

  const removeItemFromRoom = (roomId, itemId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              items: room.items.filter((item) => item.id !== itemId),
            }
          : room
      )
    );
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "$0.00";
    return `$${parseFloat(price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateRoomTotal = (room) => {
    return room.items.reduce(
      (sum, item) => sum + (parseFloat(item.formData.sellingPrice) || 0),
      0
    );
  };

  const calculateTotalCost = () => {
    return rooms.reduce((sum, room) => sum + calculateRoomTotal(room), 0);
  };

  const calculateVAT = () => {
    return calculateTotalCost() * 0.05;
  };

  const calculateFinalTotal = () => {
    const totalWithVAT = calculateTotalCost() + calculateVAT();
    const discountValue = parseFloat(discount) || 0;
    return Math.max(0, totalWithVAT - discountValue);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yOffset = 20;
    let totalSellingPrice = 0;

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFont("Playfair Display", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Curtain Measurement Invoice", pageWidth / 2, 25, { align: "center" });
    doc.setFontSize(12);
    doc.text("Your Custom Curtain Studio", pageWidth / 2, 33, { align: "center" });
    yOffset += 25;

    // Invoice Details
    doc.setFont("Open Sans", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: INV-${Date.now()}`, 10, yOffset);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 10, yOffset, {
      align: "right",
    });
    yOffset += 10;

    // Customer Information (Table)
    doc.setFont("Playfair Display", "bold");
    doc.setFontSize(14);
    doc.text("Customer Information", 10, yOffset);
    yOffset += 7;

    const customerTableData = [
      ["Name", customerData.name || "-"],
      ["Email", customerData.email || "-"],
      ["Phone", customerData.phone || "-"],
      ["Date", customerData.date || "-"],
      ["Address", customerData.address || "-"],
    ];

    autoTable(doc, {
      startY: yOffset,
      body: customerTableData,
      theme: "grid",
      styles: {
        font: "Open Sans",
        fontSize: 10,
        cellPadding: 4,
        overflow: "linebreak",
        textColor: [50, 50, 50],
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold", fillColor: [240, 240, 240] },
        1: { cellWidth: 140 },
      },
      margin: { left: 10, right: 10 },
    });
    yOffset = doc.lastAutoTable.finalY + 10;

    // Separator Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 204);
    doc.line(10, yOffset, pageWidth - 10, yOffset);
    yOffset += 10;

    // Room and Item Details
    rooms.forEach((room, index) => {
      const roomName = room.room === "Other" ? room.customRoom : room.room;
      doc.setFont("Playfair Display", "bold");
      doc.setFontSize(14);
      doc.text(`Room ${index + 1}: ${roomName || "Unnamed"}`, 10, yOffset);
      yOffset += 7;

      const tableData = room.items.flatMap((item) => {
        const sellingPrice = parseFloat(item.formData.sellingPrice) || 0;
        totalSellingPrice += sellingPrice;

        return item.type === "Accessories"
          ? [
              [
                item.type,
                item.formData.item || "-",
                item.formData.unit || "-",
                "-",
                formatPrice(item.formData.sellingPrice),
                item.formData.remarks || "-",
              ],
              ["", "", "", "", "", ""],
            ]
          : [
              [
                item.type,
                item.formData.style || "-",
                item.formData.width || "-",
                item.formData.heightCenter || "-",
                formatPrice(item.formData.sellingPrice),
                item.formData.remarks || "-",
              ],
              [
                "",
                `Fabric: ${item.formData.fabricCode || "-"} / ${
                  item.formData.fabricType || "-"
                }`,
                `Opening: ${item.formData.opening || "-"}`,
                `Left: ${item.formData.heightLeft || "-"} / Right: ${
                  item.formData.heightRight || "-"
                }`,
                "",
                "",
              ],
            ];
      });

      autoTable(doc, {
        startY: yOffset,
        head: [["Type", "Style/Item", "Width/Unit", "Height Center", "Selling Price", "Remarks"]],
        body: tableData,
        theme: "grid",
        styles: {
          font: "Open Sans",
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          textColor: [50, 50, 50],
        },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 45 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 35 },
        },
        margin: { left: 10, right: 10 },
        didParseCell: (data) => {
          if (data.row.section === "body" && data.row.index % 2 === 1) {
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.fontSize = 7;
            data.cell.styles.textColor = [100, 100, 100];
          }
        },
      });

      yOffset = doc.lastAutoTable.finalY + 15;

      if (yOffset > pageHeight - 40 && index < rooms.length - 1) {
        doc.addPage();
        yOffset = 20;
      }
    });

    // Total Price
    doc.setFont("Playfair Display", "bold");
    doc.setFontSize(14);
    doc.text("Order Summary", 10, yOffset);
    yOffset += 7;

    autoTable(doc, {
      startY: yOffset,
      body: [
        ["Subtotal", formatPrice(totalSellingPrice)],
        ["VAT (5%)", formatPrice(calculateVAT())],
        ["Discount", formatPrice(parseFloat(discount) || 0)],
        ["Final Total", formatPrice(calculateFinalTotal())],
      ],
      theme: "grid",
      styles: {
        font: "Open Sans",
        fontSize: 12,
        cellPadding: 5,
        fontStyle: "bold",
        halign: "right",
        textColor: [50, 50, 50],
      },
      columnStyles: {
        0: { cellWidth: 150, fillColor: [240, 240, 240] },
        1: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.row.index === 3) {
          data.cell.styles.textColor = [0, 102, 204];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    yOffset = doc.lastAutoTable.finalY + 20;

    // Footer
    doc.setFont("Open Sans", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Thank you for choosing Your Custom Curtain Studio!",
      pageWidth / 2,
      yOffset,
      { align: "center" }
    );
    yOffset += 10;
    doc.setFontSize(8);
    doc.text(
      "Contact us at: support@curtainstudio.com | +1-555-123-4567",
      pageWidth / 2,
      yOffset,
      { align: "center" }
    );

    doc.save("Curtain_Invoice.pdf");
  };

  const printForm = () => {
    const printContent = document.getElementById("curtain-form");
    html2canvas(printContent).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Curtain Measurement Form</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    });
  };

  const TYPE_COLORS = {
    Curtains: "bg-blue-200",
    Blinds: "bg-green-200",
    Accessories: "bg-purple-200",
    default: "bg-gray-50",
  };

  const renderCustomerInfoForm = () => (
    <div className="w-full mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-4xl font-heading text-DarkBlue mb-4">
        Looking for the perfect curtains?
      </h2>
      <p className="text-DarkBlue font-body text-sm mb-6">
        Please fill out the form below with your contact information and curtain
        preferences. We'll review your details and get back to you with the best
        options for your space.
      </p>
      <div className="flex justify-center">
        <div className="relative flex-flex-col z-10">
          {/* <div className="absolute left-[-8px] w-[460px] h-[300px] bg-[#edf4fa] -z-10"></div> */}
          {/* <img
            src={leftimage}
            alt="Left Visual"
            className="w-[450px] h-[290px] object-cover"
          /> */}
        </div>
        <div className="pl-12 w-full">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={customerData.name}
                onChange={handleCustomerChange}
                className="p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 focus:outline-none"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={customerData.email}
                onChange={handleCustomerChange}
                className="p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={customerData.phone}
                onChange={handleCustomerChange}
                className="p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 focus:outline-none"
                required
              />
              <input
                type="date"
                name="date"
                value={customerData.date}
                onChange={handleCustomerChange}
                className="p-3 bg-[#edf4fa] text-gray-700 focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                name="address"
                placeholder="Address"
                value={customerData.address}
                onChange={handleCustomerChange}
                className="w-full p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 h-40 resize-none focus:outline-none"
                required
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoomForm = (room) => (
    <div
      key={room.id}
      className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-['Playfair_Display']">
          Room {rooms.indexOf(room) + 1}:{" "}
          {room.room === "Other" ? room.customRoom || "Custom Room" : room.room || "Unnamed"}
        </h2>
        {rooms.length > 1 && (
          <button
            onClick={() => removeRoom(room.id)}
            className="text-red-500 hover:text-red-700 flex items-center gap-2 font-medium font-['Open_Sans'] transition-colors"
          >
            <Trash2 size={18} /> Remove Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Select Room
          </label>
          <select
            value={room.room}
            onChange={(e) => handleRoomChange(room.id, "room", e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans']"
          >
            <option value="">Select Room</option>
            <option value="Living Room">Living Room</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Dining Room">Dining Room</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bathroom">Bathroom</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {room.room === "Other" && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
              Custom Room Name
            </label>
            <input
              type="text"
              value={room.customRoom}
              onChange={(e) => handleRoomChange(room.id, "customRoom", e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans']"
              placeholder="Enter room name"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white font-['Open_Sans']">
              <th className="w-40 px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Style/Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Width/Unit</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Height Center</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Selling Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {room.items.map((item, index) => {
              const styles = item.type === "Curtains" ? curtainStyles : blindStyles;
              let fabricCodes = item.type === "Curtains" ? curtainFabricCodes : [];
              let fabricTypes = item.type === "Curtains" ? curtainFabricTypes : [];
              if (item.type === "Blinds" && item.formData.style) {
                fabricCodes = blindData
                  .filter((data) => data.field_96 === item.formData.style)
                  .map((data) => data.field_77)
                  .filter(Boolean);
                fabricTypes = blindData
                  .filter((data) => data.field_96 === item.formData.style)
                  .map((data) => data.field_79)
                  .filter(Boolean);
              }
              const availableUnits = item.type === "Accessories"
                ? [
                    ...new Set(
                      accessories
                        .filter((acc) => acc.item === item.formData.item)
                        .map((acc) => acc.unit)
                    ),
                  ].filter(Boolean)
                : [];

              const bgColor = TYPE_COLORS[item.type] || TYPE_COLORS.default;

              return [
                <tr
                  key={`${item.id}-main`}
                  className={`border-b border-gray-200 ${bgColor} hover:bg-opacity-80 transition-colors`}
                >
                  <td className="px-4 py-4 align-top">
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handleItemChange(room.id, item.id, "type", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                    >
                      <option value="">Select Type</option>
                      <option value="Curtains">Curtains</option>
                      <option value="Blinds">Blinds</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {item.type === "Accessories" ? (
                      <select
                        value={item.formData.item}
                        onChange={(e) =>
                          handleItemChange(room.id, item.id, "item", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                      >
                        <option value="">Select Item</option>
                        {[...new Set(accessories.map((acc) => acc.item))].map(
                          (accItem) => (
                            <option key={accItem} value={accItem}>
                              {accItem}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <select
                        value={item.formData.style}
                        onChange={(e) =>
                          handleItemChange(room.id, item.id, "style", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                      >
                        <option value="">Select Style</option>
                        {styles.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {item.type === "Accessories" ? (
                      <select
                        value={item.formData.unit}
                        onChange={(e) =>
                          handleItemChange(room.id, item.id, "unit", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                        disabled={!item.formData.item}
                      >
                        <option value="">Select Unit</option>
                        {availableUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={item.formData.width}
                        onChange={(e) =>
                          handleItemChange(room.id, item.id, "width", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                        placeholder="Width (cm)"
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {item.type === "Accessories" ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <input
                        type="text"
                        value={item.formData.heightCenter}
                        onChange={(e) =>
                          handleItemChange(
                            room.id,
                            item.id,
                            "heightCenter",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                        placeholder="Height Center (cm)"
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="relative">
                      <input
                        type="text"
                        value={item.formData.sellingPrice}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm disabled:bg-gray-200"
                        disabled
                      />
                      {loadingPrices[item.id] && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Loader2 className="animate-spin text-blue-500" size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {room.items.length > 1 && (
                      <button
                        onClick={() => removeItemFromRoom(room.id, item.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium font-['Open_Sans'] text-sm transition-colors"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </td>
                </tr>,
                item.type && (
                  <tr
                    key={`${item.id}-sub`}
                    className={`border-b border-gray-200 ${bgColor} bg-opacity-50`}
                  >
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">
                      {item.type !== "Accessories" && (
                        <select
                          value={item.formData.fabricCode}
                          onChange={(e) =>
                            handleItemChange(
                              room.id,
                              item.id,
                              "fabricCode",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                          disabled={!item.formData.style && item.type === "Blinds"}
                        >
                          <option value="">Fabric Code</option>
                          {fabricCodes.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.type !== "Accessories" && (
                        <select
                          value={item.formData.fabricType}
                          onChange={(e) =>
                            handleItemChange(
                              room.id,
                              item.id,
                              "fabricType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                          disabled={!item.formData.style && item.type === "Blinds"}
                        >
                          <option value="">Fabric Type</option>
                          {fabricTypes.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.type !== "Accessories" && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.formData.heightLeft}
                            onChange={(e) =>
                              handleItemChange(
                                room.id,
                                item.id,
                                "heightLeft",
                                e.target.value
                              )
                            }
                            className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                            placeholder="Height Left (cm)"
                          />
                          <input
                            type="text"
                            value={item.formData.heightRight}
                            onChange={(e) =>
                              handleItemChange(
                                room.id,
                                item.id,
                                "heightRight",
                                e.target.value
                              )
                            }
                            className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                            placeholder="Height Right (cm)"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.type !== "Accessories" && (
                        <select
                          value={item.formData.opening}
                          onChange={(e) =>
                            handleItemChange(
                              room.id,
                              item.id,
                              "opening",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                        >
                          <option value="">Opening</option>
                          {openings.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.formData.remarks}
                        onChange={(e) =>
                          handleItemChange(room.id, item.id, "remarks", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
                        placeholder="Remarks"
                      />
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => addItemToRoom(room.id)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors font-['Open_Sans'] text-sm"
        >
          <PlusCircle size={18} className="mr-2" /> Add Item
        </button>
        <div className="text-lg font-semibold text-gray-800 font-['Open_Sans']">
          Room Total: {formatPrice(calculateRoomTotal(room))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      id="curtain-form"
      className="max-w-6xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-gray-50 min-h-screen"
    >
      {renderCustomerInfoForm()}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-['Playfair_Display'] mb-2">
          Curtain Measurement Form
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-['Open_Sans']">
          Fill out the form below to get accurate measurements and pricing for your
          custom curtains, blinds, and accessories.
        </p>
      </div>

      {rooms.map((room) => renderRoomForm(room))}

      <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 font-['Playfair_Display'] mb-4">
          Order Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
              Subtotal
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-['Open_Sans'] text-sm">
              {formatPrice(calculateTotalCost())}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
              VAT (5%)
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-['Open_Sans'] text-sm">
              {formatPrice(calculateVAT())}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
              Discount ($)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
              placeholder="Enter discount amount"
              min="0"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
              Final Total
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-['Open_Sans'] text-sm font-semibold text-blue-600">
              {formatPrice(calculateFinalTotal())}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button
          onClick={addRoom}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-['Open_Sans'] text-sm"
        >
          <PlusCircle size={18} className="mr-2" /> Add Another Room
        </button>
        <button
          onClick={downloadPDF}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors font-['Open_Sans'] text-sm"
        >
          <Download size={18} className="mr-2" /> Download PDF
        </button>
        <button
          onClick={printForm}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors font-['Open_Sans'] text-sm"
        >
          <Printer size={18} className="mr-2" /> Print Form
        </button>
        <button
          onClick={submitOrder}
          disabled={isSubmitting || !isFormValid()}
          className={`inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors font-['Open_Sans'] text-sm ${
            isSubmitting || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : (
            <Send size={18} className="mr-2" />
          )}
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default CurtainForm;