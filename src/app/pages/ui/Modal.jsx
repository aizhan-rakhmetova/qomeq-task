"use client";

import {useState, useRef, useEffect, useCallback} from 'react';
import { useRecoilState } from 'recoil';

import { schedulesState, appointmentDurationState } from '@/recoil/atoms';

import styles from './Modal.module.scss';

export default function Modal() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [schedules, setSchedules] = useRecoilState(schedulesState);
    const [duration, setDuration] = useRecoilState(appointmentDurationState);
    const [tempSchedule, setTempSchedule] = useState([]);
    const [currentSchedule, setCurrentSchedule] = useState([]);
    const isSelecting = useRef(false);
    const actionType = useRef(null);
    const touchedColumns = useRef([]);
    const gridRef = useRef(null);

    const handleChange = (event) => {
        const newDuration = Number(event.target.value);
        setDuration(newDuration);
        setTempSchedule([...schedules[newDuration]]);
        setCurrentSchedule([...schedules[newDuration]]);
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const generateTimeSlots = useCallback(() => {
        const slots = [];
        let start = 0;
        const end = 24 * 60;

        while (start < end) {
            const timeString = new Date(0, 0, 0, 0, start).toTimeString().substring(0, 5);
            slots.push(timeString);
            start += duration;
        }

        return slots;
    }, [duration]);

    const timeSlots = generateTimeSlots();

    const getNumberOfColumns = () => {
        const grid = gridRef.current;
        if (grid) {
            const firstRowCells = grid.querySelectorAll(`.${styles.cell}`);
            const rowCells = Array.from(firstRowCells).reduce((rows, cell, index) => {
                const top = cell.offsetTop;
                if (!rows[top]) rows[top] = [];
                rows[top].push(index);
                return rows;
            }, {});

            return Math.max(...Object.values(rowCells).map((row) => row.length));
        }
        return 1;
    };

    const toggleTimeSlot = (time, add) => {
        setCurrentSchedule((prev) =>
            add ? [...prev, time] : prev.filter((t) => t !== time)
        );
    };

    const getCellCoordinates = (index) => {
        const numCols = getNumberOfColumns();
        return { row: Math.floor(index / numCols), col: index % numCols };
    };

    const handleMouseDown = (time, index) => {
        const { row, col } = getCellCoordinates(index);
        touchedColumns.current = [{ col, endRow: row }];
        isSelecting.current = true;
        actionType.current = currentSchedule.includes(time) ? "remove" : "add";
        toggleTimeSlot(time, actionType.current === "add");
    };

    const handleMouseEnter = (time, index) => {
        if (!isSelecting.current) return;

        const { row, col } = getCellCoordinates(index);
        const shouldAdd = actionType.current === "add";

        const existingColumn = touchedColumns.current.find((colData) => colData.col === col);
        if (existingColumn) {
            existingColumn.endRow = Math.max(existingColumn.endRow, row);
        } else {
            touchedColumns.current.push({ col, endRow: row });
        }

        const numCols = getNumberOfColumns();
        touchedColumns.current.forEach(({ col, endRow }) => {
            for (let r = 0; r <= endRow; r++) {
                const cellIndex = r * numCols + col;
                const cellTime = timeSlots[cellIndex];
                if (cellTime && currentSchedule.includes(cellTime) !== shouldAdd) {
                    toggleTimeSlot(cellTime, shouldAdd);
                }
            }
        });
    };

    const handleMouseUp = () => {
        isSelecting.current = false;
        actionType.current = null;
        touchedColumns.current = [];
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleCancel = () => {
        setSchedules((prev) => ({
            ...prev,
            [duration]: tempSchedule,
        }));
        setCurrentSchedule(tempSchedule);
        setModalOpen(false);
    };

    const handleSave = () => {
        setModalOpen(false);
        setSchedules((prev) => ({
            ...prev,
            [duration]: currentSchedule,
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.selectContainer}>
                <label className={styles.label} htmlFor="duration">Выберите время приёма: </label>
                <select
                    id="duration"
                    value={duration}
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value={10}>10 минут</option>
                    <option value={20}>20 минут</option>
                    <option value={30}>30 минут</option>
                    <option value={40}>40 минут</option>
                    <option value={50}>50 минут</option>
                    <option value={60}>60 минут</option>
                    <option value={90}>90 минут</option>
                </select>
            </div>

            <button className={styles.button} onClick={handleOpenModal}> Открыть модальное окно </button>

            {isModalOpen && (
                <div className={styles.modalWrapper} >
                    <div className={styles.modal}>
                        <div className={styles.scheduleGrid} ref={gridRef}>
                            {timeSlots.map((time, index) => (
                                <div
                                    key={index}
                                    data-time={time}
                                    className={`${styles.cell} ${
                                        currentSchedule.includes(time) ? styles.selected : ''
                                    }`}
                                    onMouseDown={() => handleMouseDown(time, index)}
                                    onMouseEnter={() => handleMouseEnter(time, index)}
                                    onMouseUp={handleMouseUp}
                                >
                                    {time}
                                </div>
                            ))}
                        </div>
                        <div className={styles.buttonsWrapper}>
                            <button className={`${styles.button} ${styles.primaryButton}`} onClick={handleSave}>Сохранить</button>
                            <button className={`${styles.button} ${styles.secondaryButton}`} onClick={handleCancel}>Отменить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
