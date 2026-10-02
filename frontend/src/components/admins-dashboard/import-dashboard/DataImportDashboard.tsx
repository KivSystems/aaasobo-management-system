"use client";

import { localizeAdminMessage } from "@/lib/messages/adminMessages";

import { useMemo, useState } from "react";
import Modal from "@/components/elements/modal/Modal";
import {
  downloadNormalizedImportPackage,
  executeIncrementalAdminImport,
  executeNormalizedImport,
  normalizeAdminImportSource,
  type AdminImportExecuteError,
} from "@/lib/api/adminImportApi";
import {
  type ImportExecuteErrorResponse,
  type ImportExecuteResponse,
  type ImportNormalizeResponse,
} from "@shared/schemas/admins";
import styles from "./DataImportDashboard.module.scss";

type IncrementalTarget = "customers" | "instructors";

export default function DataImportDashboard({ adminId }: { adminId: number }) {
  const [incrementalFiles, setIncrementalFiles] = useState<
    Record<IncrementalTarget, File | null>
  >({ customers: null, instructors: null });
  const [incrementalResults, setIncrementalResults] = useState<
    Partial<Record<IncrementalTarget, ImportExecuteResponse>>
  >({});
  const [incrementalIssues, setIncrementalIssues] = useState<
    Partial<Record<IncrementalTarget, ImportExecuteErrorResponse["issues"]>>
  >({});
  const [incrementalErrors, setIncrementalErrors] = useState<
    Partial<Record<IncrementalTarget, string>>
  >({});
  const [activeIncrementalImport, setActiveIncrementalImport] =
    useState<IncrementalTarget | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [normalizedZipFile, setNormalizedZipFile] = useState<File | null>(null);
  const [normalizeResult, setNormalizeResult] =
    useState<ImportNormalizeResponse | null>(null);
  const [executeResult, setExecuteResult] =
    useState<ImportExecuteResponse | null>(null);
  const [executeIssues, setExecuteIssues] = useState<
    ImportExecuteErrorResponse["issues"]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [executeErrorMessage, setExecuteErrorMessage] = useState<string>("");
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const normalizedRowsByFile = useMemo(() => {
    if (!normalizeResult) {
      return [];
    }

    return Object.entries(normalizeResult.report.normalizedRowsByFile).sort(
      ([a], [b]) => a.localeCompare(b),
    );
  }, [normalizeResult]);

  const executeRowsByFile = useMemo(() => {
    if (!executeResult) {
      return [];
    }

    return Object.entries(executeResult.report.rowsByFile).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [executeResult]);

  const handleIncrementalImport = async (target: IncrementalTarget) => {
    const file = incrementalFiles[target];
    if (!file) {
      setIncrementalErrors((current) => ({
        ...current,
        [target]: "追加対象のZIPファイルを選択してください。",
      }));
      return;
    }
    const label = target === "customers" ? "お客さま" : "インストラクター";
    if (
      !window.confirm(
        `${label}と関連データを追加しますか？ 既存のデータは保持されます。`,
      )
    ) {
      return;
    }

    setActiveIncrementalImport(target);
    setIncrementalErrors((current) => ({ ...current, [target]: "" }));
    setIncrementalIssues((current) => ({ ...current, [target]: [] }));
    setIncrementalResults((current) => {
      const next = { ...current };
      delete next[target];
      return next;
    });
    try {
      const result = await executeIncrementalAdminImport(target, file);
      setIncrementalResults((current) => ({ ...current, [target]: result }));
    } catch (error) {
      const typedError = error as AdminImportExecuteError;
      setIncrementalErrors((current) => ({
        ...current,
        [target]:
          typedError instanceof Error
            ? localizeAdminMessage(typedError.message)
            : "データの追加に失敗しました。",
      }));
      const details = typedError.details as
        | ImportExecuteErrorResponse
        | undefined;
      if (details?.issues) {
        setIncrementalIssues((current) => ({
          ...current,
          [target]: details.issues,
        }));
      }
    } finally {
      setActiveIncrementalImport(null);
    }
  };

  const renderIncrementalCard = (target: IncrementalTarget) => {
    const isCustomers = target === "customers";
    const issues = incrementalIssues[target] ?? [];
    const result = incrementalResults[target];
    return (
      <article className={styles.importCard}>
        <h3>{isCustomers ? "お客さまを追加" : "インストラクターを追加"}</h3>
        <p>
          {isCustomers
            ? "customers.csv、children.csv、subscriptions.csv が必要です。"
            : "instructors.csv、instructor_fees.csv、instructor_schedules.csv が必要です。"}
        </p>
        <label
          className={styles.fileInputLabel}
          htmlFor={`incremental-${target}-zip`}
        >
          追加対象のZIPファイル
        </label>
        <input
          id={`incremental-${target}-zip`}
          type="file"
          accept=".zip,application/zip"
          onChange={(event) =>
            setIncrementalFiles((current) => ({
              ...current,
              [target]: event.target.files?.[0] ?? null,
            }))
          }
        />
        <button
          className={styles.executeButton}
          type="button"
          disabled={activeIncrementalImport !== null}
          onClick={() => handleIncrementalImport(target)}
        >
          {activeIncrementalImport === target
            ? "確認・取り込み中..."
            : isCustomers
              ? "お客さまを追加"
              : "インストラクターを追加"}
        </button>
        {incrementalErrors[target] && (
          <p className={styles.error}>{incrementalErrors[target]}</p>
        )}
        {issues.length > 0 && (
          <div className={styles.validationReport}>
            <h4>データの問題点</h4>
            <ul className={styles.list}>
              {issues.map((item, index) => (
                <li key={`${item.file}:${item.row}:${item.column}:${index}`}>
                  [{item.file}] 行 {item.row ?? "-"}, 列 {item.column ?? "-"}:{" "}
                  {localizeAdminMessage(item.message)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result && (
          <div className={styles.successReport}>
            <h4>取り込み結果</h4>
            <p>{localizeAdminMessage(result.message)}</p>
            <ul className={styles.countList}>
              {Object.entries(result.report.importedByFile).map(
                ([fileName, count]) => (
                  <li key={fileName}>
                    {fileName}: {count}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </article>
    );
  };

  const handleNormalize = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceFile) {
      setErrorMessage("整形するCSVファイルを選択してください。");
      return;
    }

    setIsNormalizing(true);
    setErrorMessage("");
    setNormalizeResult(null);
    setExecuteResult(null);
    setExecuteErrorMessage("");
    setExecuteIssues([]);

    try {
      const result = await normalizeAdminImportSource(sourceFile);
      setNormalizeResult(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? localizeAdminMessage(error.message)
          : "データの整形に失敗しました。";
      setErrorMessage(message);
    } finally {
      setIsNormalizing(false);
    }
  };

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadNormalizedZip = async () => {
    if (!normalizeResult?.jobId) {
      setErrorMessage("ダウンロードする前にデータを整形してください。");
      return;
    }

    setIsDownloadingZip(true);
    setErrorMessage("");
    try {
      const blob = await downloadNormalizedImportPackage(normalizeResult.jobId);
      triggerDownload(blob, `normalized-import-${normalizeResult.jobId}.zip`);
    } catch (error) {
      const message =
        error instanceof Error
          ? localizeAdminMessage(error.message)
          : "ダウンロードに失敗しました。";
      setErrorMessage(message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const openExecuteModal = () => {
    if (!normalizedZipFile && !normalizeResult?.jobId) {
      setExecuteErrorMessage(
        "整形済みのZIPファイルを選択するか、先にデータを整形してください。",
      );
      return;
    }
    setExecuteErrorMessage("");
    setIsConfirmModalOpen(true);
  };

  const handleExecuteImport = async () => {
    setIsExecutingImport(true);
    setExecuteResult(null);
    setExecuteIssues([]);
    setExecuteErrorMessage("");

    try {
      const result = await executeNormalizedImport({
        file: normalizedZipFile,
        jobId: normalizedZipFile ? undefined : normalizeResult?.jobId,
      });
      setExecuteResult(result);
      setIsConfirmModalOpen(false);
    } catch (error) {
      const typedError = error as AdminImportExecuteError;
      const message =
        typedError instanceof Error
          ? localizeAdminMessage(typedError.message)
          : "データの取り込みに失敗しました。";
      setExecuteErrorMessage(message);

      const details = typedError.details as
        | ImportExecuteErrorResponse
        | undefined;
      if (details?.issues) {
        setExecuteIssues(details.issues);
      }
    } finally {
      setIsExecutingImport(false);
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>データ取り込み</h1>
        <p className={styles.subText}>
          お客さま・インストラクターのデータを追加するか、取り込み対象のデータを一括で置き換えます。
        </p>
        <p className={styles.subText}>管理者ID: {adminId}</p>
      </header>

      <section className={`${styles.operationSection} ${styles.destructive}`}>
        <div>
          <h2>一括置き換え（既存データを削除）</h2>
          <p className={styles.warningText}>
            取り込み対象のデータをすべて置き換えます。データベースを再構築する場合にのみ使用してください。
          </p>
        </div>

        <div className={styles.formSection}>
          <h2>1）CSVデータを整形</h2>
          <form className={styles.form} onSubmit={handleNormalize}>
            <label className={styles.fileInputLabel} htmlFor="raw-import-file">
              元のCSVファイル
            </label>
            <input
              id="raw-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                setSourceFile(event.target.files?.[0] ?? null);
              }}
            />
            <button
              className={styles.normalizeButton}
              type="submit"
              disabled={isNormalizing}
            >
              {isNormalizing ? "整形中..." : "データを整形"}
            </button>
          </form>
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        {normalizeResult && (
          <div className={styles.report}>
            <h2>整形結果</h2>
            <p>
              <strong>処理ID:</strong>{" "}
              <span className={styles.jobId}>{normalizeResult.jobId}</span>
            </p>
            <p>
              <strong>元データの行数:</strong> {normalizeResult.report.rawRows}
            </p>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={handleDownloadNormalizedZip}
                disabled={isDownloadingZip}
                type="button"
              >
                {isDownloadingZip
                  ? "ダウンロード中..."
                  : "整形済みZIPをダウンロード"}
              </button>
            </div>

            <h3>ファイルごとの行数</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ファイル</th>
                  <th>行数</th>
                </tr>
              </thead>
              <tbody>
                {normalizedRowsByFile.map(([fileName, rowCount]) => (
                  <tr key={fileName}>
                    <td>{fileName}</td>
                    <td>{rowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>自動生成されたお客さまのメールアドレス</h3>
            {normalizeResult.report.generatedCustomerEmails.length === 0 ? (
              <p>なし</p>
            ) : (
              <ul className={styles.list}>
                {normalizeResult.report.generatedCustomerEmails.map((item) => (
                  <li key={`${item.row}:${item.generatedEmail}`}>
                    行 {item.row}: {item.customerName} ({item.generatedEmail})
                  </li>
                ))}
              </ul>
            )}

            <h3>注意事項</h3>
            {normalizeResult.report.warnings.length === 0 ? (
              <p>なし</p>
            ) : (
              <ul className={styles.list}>
                {normalizeResult.report.warnings.map((warning) => (
                  <li key={localizeAdminMessage(warning)}>
                    {localizeAdminMessage(warning)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={styles.formSection}>
          <h2>2）データを取り込み</h2>
          <form className={styles.form}>
            <label
              className={styles.fileInputLabel}
              htmlFor="normalized-zip-file"
            >
              整形済みZIPファイル（上で整形した場合は選択不要）
            </label>
            <input
              id="normalized-zip-file"
              type="file"
              accept=".zip,application/zip"
              onChange={(event) => {
                setNormalizedZipFile(event.target.files?.[0] ?? null);
              }}
            />
            <button
              className={styles.executeButton}
              type="button"
              onClick={openExecuteModal}
            >
              取り込みを実行
            </button>
          </form>
        </div>

        {executeErrorMessage && (
          <p className={styles.error}>{executeErrorMessage}</p>
        )}

        {executeIssues.length > 0 && (
          <div className={styles.report}>
            <h3>データの問題点</h3>
            <ul className={styles.list}>
              {executeIssues.map((issue, index) => (
                <li key={`${issue.file}:${issue.row}:${issue.column}:${index}`}>
                  [{issue.file}] 行 {issue.row ?? "-"}, 列 {issue.column ?? "-"}
                  : {localizeAdminMessage(issue.message)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {executeResult && (
          <div className={styles.report}>
            <h2>取り込み結果</h2>
            <p>{localizeAdminMessage(executeResult.message)}</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ファイル</th>
                  <th>取り込んだ行数</th>
                </tr>
              </thead>
              <tbody>
                {executeRowsByFile.map(([fileName, rowCount]) => (
                  <tr key={fileName}>
                    <td>{fileName}</td>
                    <td>{rowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.operationSection}>
        <div>
          <h2>データの追加</h2>
          <p className={styles.subText}>
            既存のデータを削除・変更せず、新しいデータをまとめて追加します。
          </p>
        </div>
        <div className={styles.cardGrid}>
          {renderIncrementalCard("customers")}
          {renderIncrementalCard("instructors")}
        </div>
      </section>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        overlayClosable={true}
      >
        <div className={styles.confirmModal}>
          <h3>一括置き換えの確認</h3>
          <p>
            取り込み対象の既存データをすべて削除し、このファイルのデータに置き換えます。
          </p>
          <p>
            初期設定の管理者は保持されますが、その他のデータは完全に削除される場合があります。
          </p>
          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isExecutingImport}
            >
              キャンセル
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={handleExecuteImport}
              disabled={isExecutingImport}
            >
              {isExecutingImport ? "取り込み中..." : "取り込みを実行"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
