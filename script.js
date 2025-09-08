document.addEventListener("DOMContentLoaded", () => {
  // --- BAGIAN FUNGSI UTAMA ---
  const itemsBody = document.getElementById("items-body");
  const addItemBtn = document.getElementById("add-item-btn");
  const grandTotalEl = document.getElementById("grand-total");
  const printBtn = document.getElementById("print-btn");
  const invoiceDateEl = document.getElementById("invoice-date");
  const invoiceDateDisplayEl = document.getElementById("invoice-date-display");

  // --- FUNGSI CETAK PDF ---
  const handlePrint = () => {
    console.log("Tombol 'Cetak Invoice' diklik!"); // Pesan untuk debugging

    const element = document.querySelector(".invoice-container");
    if (!element) {
      console.error("Elemen .invoice-container tidak ditemukan!");
      alert("Error: Elemen untuk dicetak tidak ditemukan.");
      return;
    }

    const invoiceNo = document.getElementById("invoice-no").value || "invoice";
    const invoiceDate =
      document.getElementById("invoice-date-display").value || "tanggal";
    const safeInvoiceNo = invoiceNo.replace(/[/]/g, "_");

    const opt = {
      margin: 1,
      filename: `Invoice-${safeInvoiceNo}-${invoiceDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    };

    // Panggil library dan cetak
    console.log("Mencoba membuat PDF...");
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .catch((err) => {
        console.error("Gagal membuat PDF:", err);
        alert(
          "Terjadi kesalahan saat mencoba membuat PDF. Silakan periksa konsol untuk detailnya."
        );
      });
  };

  // Pastikan tombol cetak ada sebelum menambahkan event listener
  if (printBtn) {
    printBtn.addEventListener("click", handlePrint);
  } else {
    console.error("Tombol dengan ID 'print-btn' tidak ditemukan!");
  }

  // --- FUNGSI LAINNYA (TIDAK DIUBAH) ---
  const formatDateToIndonesian = (date) => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${date.getDate()} ${
      monthNames[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  const today = new Date();
  invoiceDateEl.value = today.toISOString().slice(0, 10);
  invoiceDateDisplayEl.value = formatDateToIndonesian(today);

  invoiceDateDisplayEl.addEventListener("click", () =>
    invoiceDateEl.showPicker()
  );
  invoiceDateEl.addEventListener("change", (e) => {
    if (e.target.value) {
      const parts = e.target.value.split("-");
      const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
      invoiceDateDisplayEl.value = formatDateToIndonesian(selectedDate);
    }
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const updateGrandTotal = () => {
    let total = 0;
    itemsBody.querySelectorAll("tr").forEach((row) => {
      const price =
        parseFloat(
          row.querySelector(".item-price").value.replace(/[^0-9]/g, "")
        ) || 0;
      const qty = parseInt(row.querySelector(".item-qty").value) || 0;
      const rowTotal = price * qty;
      row.querySelector(".item-total").textContent = formatCurrency(rowTotal);
      total += rowTotal;
    });
    grandTotalEl.textContent = formatCurrency(total);
  };

  const createNewRow = () => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Keterangan"><input type="text" class="item-desc" placeholder="Deskripsi barang..."></td>
      <td data-label="Harga"><input type="text" class="item-price" placeholder="0"></td>
      <td data-label="Jml"><input type="number" class="item-qty" value="1" min="1"></td>
      <td data-label="Total" class="item-total text-right">Rp 0</td>
      <td class="no-print"><button class="delete-btn">✖</button></td>
    `;
    row.querySelector(".delete-btn").addEventListener("click", () => {
      row.remove();
      updateGrandTotal();
    });
    itemsBody.appendChild(row);
    row.querySelector(".item-desc").focus();
  };

  addItemBtn.addEventListener("click", createNewRow);
  itemsBody.addEventListener("input", (e) => {
    if (e.target.matches(".item-price, .item-qty")) {
      const priceInput = e.target.closest("tr").querySelector(".item-price");
      let value = priceInput.value.replace(/[^0-9]/g, "");
      priceInput.value = value
        ? new Intl.NumberFormat("id-ID").format(value)
        : "";
      updateGrandTotal();
    }
  });

  createNewRow();
});
