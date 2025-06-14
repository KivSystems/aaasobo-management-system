"use client";

import React, { ChangeEvent, DragEvent, useEffect, useState } from "react";
import styles from "./Uploader.module.scss";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

function Uploader() {
  // const [data, setData] = useState<{ image: string | null }>({ image: null });
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  // const [dragActive, setDragActive] = useState<boolean>(false);
  // const [saving, setSaving] = useState<boolean>(false);

  // const onChangePicture = useCallback(
  //   (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.currentTarget.files && event.currentTarget.files[0];
  //     if (file) {
  //       if (file.size / 1024 / 1024 > 50) {
  //         // TODO: Add the toast here.
  //         console.log("Error: File size is too big.");
  //       } else {
  //         setFile(file);
  //         const reader = new FileReader();
  //         reader.onload = (e) => {
  //           setData((prev) => ({ ...prev, image: e.target?.result as string }));
  //         };
  //         reader.readAsDataURL(file);
  //       }
  //     }
  //   },
  //   [setData],
  // );

  // const saveDisabled = useMemo(() => {
  //   return !data.image || saving;
  // }, [data.image, saving]);

  // const submitHandler = async (e) => {
  //   e.preventDefault();
  //   setSaving(true);
  //   // TODO: fetch upload files.
  //   fetch("url", {
  //     method: "POST",
  //     headers: { "content-type": file?.type || "application/octet-stream" },
  //     body: file,
  //   }).then(async (res) => {
  //       if(res.status === 200) {
  //           const {url} = (await res.json()) as PutBlobResult

  //       }
  //   });
  // };

  // useEffect(() => {
  //   setFile(null);
  // });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    const url = URL.createObjectURL(e.target.files?.[0] as Blob);
    setFiles(selectedFiles);
    setFileName(url);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files;
    const url = URL.createObjectURL(e.dataTransfer.files?.[0] as Blob);
    setFiles(droppedFile);
    setFileName(url);
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setFiles(null);
    setFileName("");
  };

  return (
    <section className={styles.dragDrop}>
      <p className={styles.label}>
        Instructor profile image<span className={styles.required}>*</span>
      </p>
      <div
        className={`${styles.documentUploader} ${isDragging ? styles.dragging : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <PhotoIcon width={50} height={50} color="#ccc" />
        <div className={styles.uploadInfo}>
          <div>
            <p>Drop instructor&apos;s profile image here, or&nbsp;</p>
          </div>
          <label htmlFor="images" className={styles.uploadBtn}>
            Browse
            <input
              type="file"
              id="images"
              accept=".png,.jpg"
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>
        <p>Supports: JPG, PNG</p>
      </div>

      {files && files.length > 0 && (
        <div className={styles.successFile}>
          <div className={styles.successFileInfo}>
            <Image
              src={fileName}
              width={50}
              height={50}
              alt="Uploaded content"
            />
            <p>{files[0].name}</p>
          </div>
          <p className={styles.fileActions} onClick={handleRemoveFile}>
            ×
          </p>
        </div>
      )}
    </section>
  );
}

export default Uploader;
