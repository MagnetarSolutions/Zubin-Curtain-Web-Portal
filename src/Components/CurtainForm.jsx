import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { PlusCircle, Trash2, Loader2, Printer, Download, Send } from "lucide-react";

const CurtainForm = () => {
  // Customer Info State
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    mobile: "",
    email: "",
    billingAddress: "",
    note: "",
  });

  // Property Info State
  const [propertyData, setPropertyData] = useState({
    unit: "",
    building: "",
    street: "",
    city: "",
    county: "",
    notes: "",
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
  const [blindStyles, setBlindStyles] = useState([]);
  const [blindData, setBlindData] = useState([]);
  const [accessoryItems, setAccessoryItems] = useState([]);
  const [curtainStyleData, setCurtainStyleData] = useState([]);
  const [curtainFabricData, setCurtainFabricData] = useState([]);
  const [accessoriesData, setAccessoriesData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openings = ["Left to Right", "Right to Left", "Center Split"];

  // Headers for fetching data (unchanged)
  const headers = {
    "X-Tadabase-App-id": "oOjD1mm1rB",
    "X-Tadabase-App-Key": "bk9nJWXUemy7",
    "X-Tadabase-App-Secret": "UzbXvsZWbS10hkwzQgErMklUpdUopAhR",
    "Content-Type": "application/json",
  };

  // Headers for submitting data to Tadabase
  const submitHeaders = {
    "X-Tadabase-App-Id": "VXr7nbOxjJ",
    "X-Tadabase-App-Key": "DvnzUumOjKzF",
    "X-Tadabase-App-Secret": "GIZ6dl8GedLOkiF4gXdTQtLcHjtjyNKa",
    "Content-Type": "application/json",
  };

  // Helper function to post data to Tadabase
  const postToTadabase = async (tableId, payload) => {
    const url = `https://api.tadabase.io/api/v1/data-tables/${tableId}/records`;
    const response = await fetch(url, {
      method: "POST",
      headers: submitHeaders,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to post to table ${tableId}`);
    }
    return response.json();
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const curtainStyleResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/lGArg7rmR6/records",
          { headers }
        );
        const curtainStyleResponseData = await curtainStyleResponse.json();
        setCurtainStyleData(curtainStyleResponseData.items);
        setCurtainStyles(
          [...new Set(curtainStyleResponseData.items.map((item) => item.field_42))].filter(
            Boolean
          )
        );

        const curtainFabricResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/eykNOvrDY3/records",
          { headers }
        );
        const curtainFabricResponseData = await curtainFabricResponse.json();
        setCurtainFabricData(curtainFabricResponseData.items);
        setCurtainFabricCodes(
          [...new Set(curtainFabricResponseData.items.map((item) => item.field_45))].filter(
            Boolean
          )
        );

        const blindResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/VX9QoerwYv/records",
          { headers }
        );
        const blindResponseData = await blindResponse.json();
        setBlindData(blindResponseData.items);
        setBlindStyles(
          [...new Set(blindResponseData.items.map((item) => item.field_96))].filter(Boolean)
        );

        const accessoriesResponse = await fetch(
          "https://api.tadabase.io/api/v1/data-tables/q3kjZVj6Vb/records",
          { headers }
        );
        const accessoriesResponseData = await accessoriesResponse.json();
        setAccessoriesData(accessoriesResponseData.items);
        setAccessoryItems(
          [...new Set(accessoriesResponseData.items.map((item) => item.field_71))].filter(
            Boolean
          )
        );
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle Customer Info Input Changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData({
      ...customerData,
      [name]: value,
    });
  };

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    setPropertyData({
      ...propertyData,
      [name]: value,
    });
  };

  // Check if all required fields are filled
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

  // Validate entire form
  const isFormValid = () => {
    return (
      customerData.firstName &&
      customerData.lastName &&
      customerData.mobile &&
      customerData.email &&
      customerData.billingAddress &&
      rooms.every((room) =>
        room.items.every(
          (item) => areRequiredFieldsFilled(item) && item.formData.sellingPrice
        )
      )
    );
  };

  // Calculate selling price locally
  const calculateSellingPrice = (type, formData) => {
    if (type === "Curtains") {
      const styleData = curtainStyleData.find((s) => s.field_42 === formData.style);
      const fabricData = curtainFabricData.find((f) => f.field_45 === formData.fabricCode);
      if (!styleData || !fabricData) return 0;

      const fullness = parseFloat(styleData.field_43);
      const stitchingCostPerMeter = parseFloat(styleData.field_44);
      const fabricWidth = parseFloat(fabricData.field_48);
      const materialCostPerMeter = parseFloat(fabricData.field_49);

      const width = parseFloat(formData.width);
      const heightLeft = parseFloat(formData.heightLeft);
      const heightCenter = parseFloat(formData.heightCenter);
      const heightRight = parseFloat(formData.heightRight);
      const windowHeight = Math.max(heightLeft, heightCenter, heightRight);

      if (isNaN(width) || isNaN(windowHeight)) return 0;

      const panel = Math.ceil((width * fullness) / fabricWidth);
      const fabricMeter = panel * ((windowHeight + 35) / 100);
      const materialCost = fabricMeter * materialCostPerMeter;
      const stitchingCost = (width / 100) * stitchingCostPerMeter;
      const productionCost = materialCost + stitchingCost;
      return Math.ceil(productionCost * 2.5); // 250% markup
    } else if (type === "Blinds") {
      const fabricData = blindData.find((f) => f.field_77 === formData.fabricCode);
      if (!fabricData) return 0;

      const materialCostPerSqMeter = parseFloat(fabricData.field_81);

      const width = parseFloat(formData.width);
      const heightLeft = parseFloat(formData.heightLeft);
      const heightCenter = parseFloat(formData.heightCenter);
      const heightRight = parseFloat(formData.heightRight);
      const windowHeight = Math.max(heightLeft, heightCenter, heightRight);

      if (isNaN(width) || isNaN(windowHeight)) return 0;

      const fabricSqMeter = (width * windowHeight) / 10000;
      const productionCost = fabricSqMeter * materialCostPerSqMeter;
      return Math.ceil(productionCost * 2.5); // 250% markup
    } else if (type === "Accessories") {
      const accessoryData = accessoriesData.find(
        (a) => a.field_71 === formData.item && a.field_72 === formData.unit
      );
      return accessoryData ? parseFloat(accessoryData.field_75) : 0;
    }
    return 0;
  };

  // Handle item changes and calculate selling price
  const handleItemChange = (roomId, itemId, field, value) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              items: room.items.map((item) => {
                if (item.id !== itemId) return item;

                let updatedFormData = { ...item.formData };

                if (field === "type") {
                  return {
                    ...item,
                    type: value,
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
                  };
                } else if (field === "item") {
                  updatedFormData = {
                    ...updatedFormData,
                    item: value,
                    unit: "",
                    sellingPrice: "",
                  };
                } else if (field === "style" && item.type === "Blinds") {
                  updatedFormData = {
                    ...updatedFormData,
                    style: value,
                    fabricCode: "",
                    fabricType: "",
                    sellingPrice: "",
                  };
                } else if (field === "fabricCode" && (item.type === "Curtains" || item.type === "Blinds")) {
                  let fabricType = "";
                  if (item.type === "Curtains") {
                    const selectedFabric = curtainFabricData.find((f) => f.field_45 === value);
                    fabricType = selectedFabric ? selectedFabric.field_47 : "";
                  } else if (item.type === "Blinds") {
                    const selectedFabric = blindData.find((f) => f.field_77 === value);
                    fabricType = selectedFabric ? selectedFabric.field_79 : "";
                  }
                  updatedFormData = {
                    ...updatedFormData,
                    fabricCode: value,
                    fabricType,
                    sellingPrice: "",
                  };
                } else {
                  updatedFormData[field] = value;
                  if (field !== "remarks") updatedFormData.sellingPrice = "";
                }

                if (areRequiredFieldsFilled({ type: item.type, formData: updatedFormData })) {
                  const sellingPrice = calculateSellingPrice(item.type, updatedFormData);
                  updatedFormData.sellingPrice = sellingPrice.toString();
                }

                return { ...item, formData: updatedFormData };
              }),
            }
          : room
      )
    );
  };

  // Submit order to Tadabase
  const submitOrder = async () => {
    setIsSubmitting(true);

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill out all required fields and ensure prices are calculated.",
      });
      setIsSubmitting(false);
      return;
    }

    const customerId = uuidv4();
    const propertyId = uuidv4();
    const quoteId = uuidv4();
    const currentDate = new Date().toISOString().split("T")[0];

    const customerPayload = {
      field_40: customerId,
      field_41: currentDate,
      field_43: customerData.firstName,
      field_44: customerData.lastName,
      field_45: customerData.companyName,
      field_46: customerData.mobile,
      field_47: customerData.email,
      field_48: customerData.billingAddress,
      field_49: customerData.note,
    };

    const propertyPayload = {
      field_50: customerId,
      field_51: propertyId,
      field_52: propertyData.unit,
      field_53: propertyData.building,
      field_54: propertyData.street,
      field_55: propertyData.city,
      field_56: propertyData.county,
      field_57: propertyData.notes,
    };

    const quotePayload = {
      field_58: customerId,
      field_59: quoteId,
      field_60: currentDate,
      field_63: "In process",
      field_64: "pending",
      field_62: calculateTotalCost().toString(),
      field_141: "5", // VAT 5%
      field_142: (parseFloat(discount) || 0).toString(),
      field_143: calculateFinalTotal().toString(),
    };

    const allItems = rooms.flatMap((room) =>
      room.items.map((item) => ({
        roomName: room.room === "Other" ? room.customRoom : room.room,
        item,
      }))
    );

    const itemPayloads = allItems.map((entry, index) => {
      const { roomName, item } = entry;
      return {
        field_67: quoteId,
        field_68: roomName,
        field_69: (index + 1).toString(),
        field_70: item.type,
        field_71: item.type === "Accessories" ? item.formData.item : item.formData.style,
        field_72: item.type === "Accessories" ? item.formData.unit : item.formData.width,
        field_73: item.type === "Accessories" ? "" : item.formData.fabricCode,
        field_74: item.type === "Accessories" ? "" : item.formData.fabricType,
        field_75: item.type === "Accessories" ? "" : item.formData.heightCenter,
        field_76: item.type === "Accessories" ? "" : item.formData.heightLeft,
        field_77: item.type === "Accessories" ? "" : item.formData.heightRight,
        field_78: item.type === "Accessories" ? "" : item.formData.opening,
        field_140: (parseFloat(item.formData.sellingPrice) || 0).toString(),
        field_79: item.formData.remarks || "",
      };
    });

    try {
      // Post to Customer Info table
      await postToTadabase("lGArg7rmR6", customerPayload);
      // Post to Property Info table
      await postToTadabase("eykNOvrDY3", propertyPayload);
      // Post to Quote table
      await postToTadabase("K2ejlOQo9B", quotePayload);
      // Post to Items table
      for (const itemPayload of itemPayloads) {
        await postToTadabase("698rd2QZwd", itemPayload);
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Order submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form
      setCustomerData({
        firstName: "",
        lastName: "",
        companyName: "",
        mobile: "",
        email: "",
        billingAddress: "",
        note: "",
      });
      setPropertyData({
        unit: "",
        building: "",
        street: "",
        city: "",
        county: "",
        notes: "",
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

  const handleRoomChange = (roomId, field, value) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, [field]: value } : room
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
          ? { ...room, items: room.items.filter((item) => item.id !== itemId) }
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

  const generatePDF = () => {
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

    // Customer Information
    doc.setFont("Playfair Display", "bold");
    doc.setFontSize(14);
    doc.text("Customer Information", 10, yOffset);
    yOffset += 7;

    const customerTableData = [
      ["Name", `${customerData.firstName || "-"} ${customerData.lastName || ""}`],
      ["Company", customerData.companyName || "-"],
      ["Email", customerData.email || "-"],
      ["Mobile", customerData.mobile || "-"],
      ["Billing Address", customerData.billingAddress || "-"],
      ["Note", customerData.note || "-"],
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

    // Property Information
    doc.setFont("Playfair Display", "bold");
    doc.setFontSize(14);
    doc.text("Property Information", 10, yOffset);
    yOffset += 7;

    const propertyTableData = [
      ["Unit #", propertyData.unit || "-"],
      ["Building", propertyData.building || "-"],
      ["Street", propertyData.street || "-"],
      ["City", propertyData.city || "-"],
      ["County", propertyData.county || "-"],
      ["Notes", propertyData.notes || "-"],
    ];

    autoTable(doc, {
      startY: yOffset,
      body: propertyTableData,
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
        doc.setFillColor(0, 102, 204);
        doc.rect(0, 0, pageWidth, 40, "F");
        doc.setFont("Playfair Display", "bold");
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text("Curtain Measurement Invoice", pageWidth / 2, 25, { align: "center" });
        doc.setFontSize(12);
        doc.text("Your Custom Curtain Studio", pageWidth / 2, 33, { align: "center" });
        yOffset = 50;
      }
    });

    // Order Summary
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
        ["Total", formatPrice(calculateFinalTotal())],
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

    return doc;
  };

  const downloadPDF = () => {
    const doc = generatePDF();
    doc.save("Curtain_Invoice.pdf");
  };

  const printForm = () => {
    Swal.fire({
      title: "Preparing Print...",
      text: "Please wait while the PDF is being generated.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const doc = generatePDF();
      const pdfDataUrl = doc.output("datauristring");
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        Swal.fire({
          icon: "error",
          title: "Pop-Up Blocked",
          text: "Please enable pop-ups and try again.",
        });
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Curtain Measurement Form</title>
            <style>
              body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${pdfDataUrl}" onload="setTimeout(() => { window.print(); }, 500);"></iframe>
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onafterprint = () => printWindow.close();
      setTimeout(() => {
        if (printWindow && !printWindow.closed) printWindow.close();
      }, 30000);

      Swal.close();
    } catch (error) {
      console.error("Error generating PDF for print:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate PDF for printing.",
      });
    }
  };

  const TYPE_COLORS = {
    Curtains: "bg-blue-200",
    Blinds: "bg-green-200",
    Accessories: "bg-purple-200",
    default: "bg-gray-50",
  };

  const renderCustomerInfoForm = () => (
    <div className="w-full mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-800 mb-2">
        Customer Information
      </h2>
      <p className="text-gray-600 font-['Open_Sans'] text-sm mb-6">
        Please provide your contact and billing details below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={customerData.firstName}
            onChange={handleCustomerChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={customerData.lastName}
            onChange={handleCustomerChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={customerData.companyName}
            onChange={handleCustomerChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Mobile *
          </label>
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={customerData.mobile}
            onChange={handleCustomerChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
          Email *
        </label>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={customerData.email}
          onChange={handleCustomerChange}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
          Billing Address *
        </label>
        <textarea
          name="billingAddress"
          placeholder="Billing Address"
          value={customerData.billingAddress}
          onChange={handleCustomerChange}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm resize-none h-24"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
          Note
        </label>
        <textarea
          name="note"
          placeholder="Additional Notes"
          value={customerData.note}
          onChange={handleCustomerChange}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm resize-none h-24"
        ></textarea>
      </div>
    </div>
  );

  const renderPropertyInfoForm = () => (
    <div className="w-full mx-auto mt-6 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-800 mb-2">
        Property Information
      </h2>
      <p className="text-gray-600 font-['Open_Sans'] text-sm mb-6">
        Please provide the property details where the curtains will be installed.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Unit #
          </label>
          <input
            type="text"
            name="unit"
            placeholder="Unit Number"
            value={propertyData.unit}
            onChange={handlePropertyChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Building
          </label>
          <input
            type="text"
            name="building"
            placeholder="Building Name/Number"
            value={propertyData.building}
            onChange={handlePropertyChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            Street
          </label>
          <input
            type="text"
            name="street"
            placeholder="Street Name"
            value={propertyData.street}
            onChange={handlePropertyChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
            City
          </label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={propertyData.city}
            onChange={handlePropertyChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
          County
        </label>
        <input
          type="text"
          name="county"
          placeholder="County"
          value={propertyData.county}
          onChange={handlePropertyChange}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Open_Sans']">
          Notes
        </label>
        <textarea
          name="notes"
          placeholder="Additional Property Notes"
          value={propertyData.notes}
          onChange={handlePropertyChange}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-['Open_Sans'] text-sm resize-none h-24"
        ></textarea>
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
            {room.items.map((item) => {
              const styles = item.type === "Curtains" ? curtainStyles : blindStyles;
              let fabricCodes = item.type === "Curtains" ? curtainFabricCodes : [];
              if (item.type === "Blinds" && item.formData.style) {
                fabricCodes = blindData
                  .filter((data) => data.field_96 === item.formData.style)
                  .map((data) => data.field_77)
                  .filter(Boolean);
              }
              const availableUnits = item.type === "Accessories"
                ? [
                    ...new Set(
                      accessoriesData
                        .filter((acc) => acc.field_71 === item.formData.item)
                        .map((acc) => acc.field_72)
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
                        {accessoryItems.map((accItem) => (
                          <option key={accItem} value={accItem}>
                            {accItem}
                          </option>
                        ))}
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
                    <input
                      type="text"
                      value={item.formData.sellingPrice}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition-colors font-['Open_Sans'] text-sm disabled:bg-gray-200"
                      disabled
                    />
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
                        <input
                          type="text"
                          value={item.formData.fabricType}
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition-colors font-['Open_Sans'] text-sm"
                          readOnly
                        />
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
      {renderPropertyInfoForm()}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-['Playfair_Display'] mb-2">
          Curtain Measurement Form
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-['Open_Sans']">
          Fill out the form below to get accurate measurements and pricing.
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